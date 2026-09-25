#include "SecureInput.h"
#include <readpassphrase.h>
#include <string.h>
#include <sys/resource.h>
#include <CommonCrypto/CommonKeyDerivation.h>

int localotp_read_hidden(const char *prompt, char *buffer, size_t capacity) {
    if (capacity < 2) return -1;
    if (!readpassphrase(prompt, buffer, capacity, RPP_REQUIRE_TTY | RPP_ECHO_OFF)) return -1;
    // readpassphrase discards overflow; reject full buffers to prevent silent truncation.
    if (strlen(buffer) >= capacity - 1) return -2;
    return 0;
}

void localotp_wipe(void *buffer, size_t length) {
    memset_s(buffer, length, 0, length);
}

int localotp_disable_core_dumps(void) {
    struct rlimit limit = {0, 0};
    return setrlimit(RLIMIT_CORE, &limit);
}

int localotp_transfer_key(const void *password, size_t password_length,
                         const void *salt, size_t salt_length, void *output) {
    return CCKeyDerivationPBKDF(kCCPBKDF2, password, password_length,
                               salt, salt_length, kCCPRFHmacAlgSHA256,
                               600000, output, 32);
}
