#!/usr/bin/env bash
set -e

# Load the secrets specific config
source "$(dirname "$0")/config.sh"

# Parse the arguments
source "$(dirname "$0")/../parser.sh"
parse_args "Pull secrets from OpenBao to the local environment." "$@"

# Define the pull function
pull() {
  local env_path="$1"
  local bao_path="$2"
  bao_path="$BAO_MOUNT/$bao_path"

  # e.g. labrador/scottystack/local/web -> labrador/scottystack/generated/local/web
  local generated_path
  generated_path=$(sed 's|^[^/]*/[^/]*|&/generated|' <<<"$bao_path")

  echo -e "${BLUE_TEXT}Pulling from \"$generated_path\" and \"$bao_path\" to \"$env_path\"${RESET_TEXT}"

  # Fetch the generated secrets
  local generated_json=$EMPTY_JSON
  local fetched_generated_json
  set +e
  fetched_generated_json=$(bao kv get -format=json "$generated_path" 2>/dev/null)
  set -e
  if [ -n "$fetched_generated_json" ]; then
    generated_json=$fetched_generated_json
  fi

  # Fetch the secrets from the original path
  local original_json=$EMPTY_JSON
  local fetched_original_json
  set +e
  fetched_original_json=$(bao kv get -format=json "$bao_path" 2>/dev/null)
  set -e
  if [ -n "$fetched_original_json" ]; then
    original_json=$fetched_original_json
  fi

  # If no secrets found, exit with an error
  if [ "$generated_json" = $EMPTY_JSON ] && [ "$original_json" = $EMPTY_JSON ]; then
    echo -e "${RED_TEXT}Error: No secrets found at \"$generated_path\" or \"$bao_path\"${RESET_TEXT}" >&2
    exit 1
  fi

  # Merge the secrets with the original secrets overriding the generated secrets
  # and write to the environment file
  local env_content
  env_content=$(
    jq -r -s \
      '(.[0].data.data // {}) * (.[1].data.data // {}) | to_entries[] | "\(.key)=\"\(.value)\""' \
      <(printf '%s' "$generated_json") \
      <(printf '%s' "$original_json")
  )

  printf '%s\n' "$env_content" >"$env_path"
}

# Run the pull
source "$(dirname "$0")/run.sh"
