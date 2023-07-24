WEB_HOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854"
current_datetime=$(date '+%Y-%m-%d %H:%M:%S')
SELF_DOMAIN_NAME=''

if [[ "$CI_COMMIT_REF_NAME" == "master" ]] || [[ "$CI_COMMIT_REF_NAME" == "main" ]]; then SELF_DOMAIN_NAME=''; else SELF_DOMAIN_NAME=-$CI_COMMIT_REF_NAME; fi

href="canvas-${CI_COMMIT_REF_NAME}.abclive.cloud"

echo $href

context="{
  \"msg_type\": \"post\",
  \"content\": {
    \"post\": {
      \"zh-CN\": {
        \"title\": \"CICD信息\",
        \"content\": [
          [
            {
              \"tag\": \"text\",
              \"text\": \"发布分支：$CI_COMMIT_REF_NAME\"
            },
                       {
              \"tag\": \"text\",
              \"text\": \"提交的信息是：$CI_COMMIT_MESSAGE\"
            },
            {
              \"tag\": \"text\",
              \"text\": \"发布时间：$current_datetime\"
            },
            {
              \"tag\": \"a\",
              \"text\": \"发布地址\",
              \"href\": \"$href\"
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
    -d "$context"
