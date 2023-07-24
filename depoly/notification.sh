WEB_HOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854"
curl -X POST \
    $WEB_HOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{
    "msg_type": "post",
    "content": {
        "post": {
            "zh_cn": {
                "title": "CICD发布",
                "content": [
                    [
                        {
                            "tag": "text",
                            "text": "'$CI_COMMIT_REF_NAME'",
                            "url": "'canvas${SELF_DOMAIN_NAME}.abclive.cloud'"
                        }
                    ],
                    [

                    ]
                ]
            }
        }
    }
}'
