#!/bin/bash

# Find the absolute paths
NODE_PATH=$(which node)
DIR_PATH="$(pwd)"
SCRIPT_PATH="$DIR_PATH/index.js"
LOG_PATH="$DIR_PATH/cron.log"

# Define the cron job to run every Sunday at 7:00 AM local time
CRON_JOB="0 7 * * 0 cd \"$DIR_PATH\" && $NODE_PATH \"$SCRIPT_PATH\" >> \"$LOG_PATH\" 2>&1"

echo "Setting up cron job to run at 7:00 AM every Sunday..."

# Add to crontab if it doesn't already exist
(crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH"; echo "$CRON_JOB") | crontab -

echo "✅ Cron job successfully scheduled!"
echo "It will run: $CRON_JOB"
echo "Logs will be written to: $LOG_PATH"
echo "Make sure your .env file is fully configured before Sunday."
