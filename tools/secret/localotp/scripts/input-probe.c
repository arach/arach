// Test helper only. Never installed with the CLI; prints no input.
#include "SecureInput.h"
#include <stdio.h>
int main(void) {
    char buffer[64] = {0};
    int status = localotp_read_hidden("Hidden fixture: ", buffer, sizeof(buffer));
    localotp_wipe(buffer, sizeof(buffer));
    puts(status == 0 ? "accepted" : "rejected");
    return status == 0 ? 0 : 1;
}
