WEB_HOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854"
current_datetime=$(date '+%Y-%m-%d %H:%M:%S')
href="${CI_COMMIT_REF_NAME}-canvas${SELF_DOMAIN_NAME}.abclive.cloud"
context="{
  \"msg_type\": \"post\",
  \"content\": {
    \"post\": {
      \"zh-CN\": {
        \"title\": \"富文本消息测试！\",
        \"content\": [
          [
            {
              \"tag\": \"text\",
              \"text\": \"$current_datetime\"
            },
            {
              \"tag\": \"a\",
              \"text\": \"点击查看\",
              \"href\": \"https://sspai.com/u/100gle/updates\"
            }
          ]
        ]
      }
    }
  }
}"

curl -X POST \
    $WEB_HOOK_URL \
    -H 'Content-Type: application/json' \
    -d $context
