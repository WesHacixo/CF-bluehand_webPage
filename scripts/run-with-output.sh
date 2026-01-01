#!/bin/bash

# Run command and capture output to file
# Workaround for terminal output capture issue

CMD="$1"
OUTPUT_FILE="${2:-/tmp/command_output.txt}"

echo "Running: $CMD" >&2
echo "Output file: $OUTPUT_FILE" >&2

eval "$CMD" > "$OUTPUT_FILE" 2>&1
EXIT_CODE=$?

echo "Exit code: $EXIT_CODE" >&2
echo "Output saved to: $OUTPUT_FILE" >&2
echo "---" >&2
cat "$OUTPUT_FILE"
echo "---" >&2

exit $EXIT_CODE

