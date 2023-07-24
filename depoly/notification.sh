WEB_HOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854"
current_datetime=$(date '+%Y-%m-%d %H:%M:%S')
href="${CI_COMMIT_REF_NAME}-canvas${SELF_DOMAIN_NAME}.abclive.cloud"
# content="{
#   "msg_type": "post",
#   "content": {
#     "post": {
#       "zh-CN": {
#         "title": "CICD消息",
#         "content": [
#           [
#             {
#               "tag": "text",
#               "text": "CI_COMMIT_REF_NAME分支于current_datetime发布上线"
#             },
#             {
#               "tag": "a",
#               "text": "点击查看",
#               "href": "'href'"
#             }
#           ]
#         ]
#       }
#     }
# }
# }"

# echo $content

# curl -X POST \
#     "https://open.feishu.cn/open-apis/bot/v2/hook/f0b1358b-38ce-4f01-b629-64c0d2fbe854" \
#     -H 'Content-Type: application/json' \
#     -d content
curl -X POST \
    $WEB_HOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{
    "msg_type": "text",
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
