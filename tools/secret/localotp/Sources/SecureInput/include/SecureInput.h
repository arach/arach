#ifndef LOCALOTP_SECURE_INPUT_H
#define LOCALOTP_SECURE_INPUT_H
#include <stddef.h>
int localotp_read_hidden(const char *prompt, char *buffer, size_t capacity);
void localotp_wipe(void *buffer, size_t length);
int localotp_disable_core_dumps(void);
int localotp_transfer_key(const void *password, size_t password_length,
                         const void *salt, size_t salt_length, void *output);
#endif
