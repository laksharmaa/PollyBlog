#!/usr/bin/env bash
# Migrates all three tables from the old Serverless Framework stack into the
# new SAM stack's tables.
#
# Usage:
#   ./scripts/migrate-all.sh <new-stack-name> [region] [--dry-run]
#
# Example:
#   ./scripts/migrate-all.sh blog-platform-backend ap-south-1
#   ./scripts/migrate-all.sh blog-platform-backend ap-south-1 --dry-run
set -euo pipefail

STACK_NAME="${1:?Usage: ./scripts/migrate-all.sh <new-stack-name> [region] [--dry-run]}"
REGION="${2:-ap-south-1}"
DRY_RUN="${3:-}"

declare -A TABLES=( [Users]="Users" [Blogs]="Blogs" [SavedBlogs]="SavedBlogs" )

for OLD_NAME in "${!TABLES[@]}"; do
  NEW_NAME="${STACK_NAME}-${TABLES[$OLD_NAME]}"
  echo ""
  echo "=== Migrating $OLD_NAME -> $NEW_NAME ==="
  node "$(dirname "$0")/migrate-data.js" --from "$OLD_NAME" --to "$NEW_NAME" --region "$REGION" $DRY_RUN
done

echo ""
echo "All tables processed."
