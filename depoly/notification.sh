WEB_HOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854"
current_datetime=$(date '+%Y-%m-%d %H:%M:%S')
curl -X POST \
    "https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854" \
    -H 'Content-Type: application/json' \
    -d '{
    "msg_type": "text",
    "content": {
        "text":"'$current_datetime'：'$CI_COMMIT_REF_NAME'.'canvas${SELF_DOMAIN_NAME}.abclive.cloud'",
    }
}'
