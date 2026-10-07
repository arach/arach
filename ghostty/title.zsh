# Ghostty titlebar — path · branch · load · job
# Ghostty has no iTerm status bar; OSC 2 is the hook.

[[ "$TERM_PROGRAM" == ghostty || -n "$GHOSTTY_RESOURCES_DIR" ]] || return

__ghostty_job="zsh"

__ghostty_short_path() {
  local dir="${PWD/#$HOME/~}"
  local parts
  parts=("${(s:/:)dir}")
  if (( ${#dir} > 28 && ${#parts} > 2 )); then
    print -r -- "…/${parts[-2]}/${parts[-1]}"
  else
    print -r -- "$dir"
  fi
}

__ghostty_branch() {
  git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null
}

__ghostty_load() {
  sysctl -n vm.loadavg 2>/dev/null | awk '{printf "%.2f", $2}'
}

__ghostty_set_title() {
  local path_ branch load job
  path_="$(__ghostty_short_path)"
  branch="$(__ghostty_branch)"
  load="$(__ghostty_load)"
  job="${__ghostty_job:-zsh}"
  job="${job%% *}"
  job="${job:t}"

  local bits=("$path_")
  [[ -n "$branch" ]] && bits+=("$branch")
  [[ -n "$load" ]] && bits+=("$load")
  [[ -n "$job" && "$job" != "zsh" && "$job" != "-zsh" ]] && bits+=("$job")

  local title="${(j:  ·  :)bits}"
  printf '\033]2;%s\007' "$title"
}

__ghostty_preexec() {
  __ghostty_job="${1:-zsh}"
  __ghostty_set_title
}

__ghostty_precmd() {
  __ghostty_job="zsh"
  __ghostty_set_title
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd __ghostty_precmd
add-zsh-hook preexec __ghostty_preexec

# Refresh load while sitting at the prompt.
PERIOD=10
periodic() { __ghostty_set_title }

# herdr --session X → title becomes the session name.
# Also strip agent colour-suppression so a typed `herdr` cannot pin NO_COLOR
# onto the daemon (herdr execs agents with the server process env).
if (( $+commands[herdr] )); then
  herdr() {
    if [[ "$1" == --session && -n "$2" ]]; then
      printf '\033]2;%s\007' "$2"
    fi
    # env runs the herdr binary on PATH, not this function.
    env -u NO_COLOR -u FORCE_COLOR -u CLICOLOR -u CLICOLOR_FORCE \
      -u CARGO_TERM_COLOR -u PIP_NO_COLOR \
      herdr "$@"
  }
fi
