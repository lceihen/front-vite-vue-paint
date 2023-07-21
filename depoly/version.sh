touch '../public/version'

file_name='../public/version'

line_count=$(wc -l <"$file_name")

log="$(git log -5 --pretty=format:"%h**%s**%cd |" --date=format:"%Y年%m月%d日%H时%M分%S秒")"

echo $log

handleWriteLog() {

    echo "$log" >"${file_name}.tmp"
    cat "$file_name" >>"$file_name.tmp"
    mv "$file_name.tmp" "$file_name"
    if [ "$line_count" -ge 5 ]; then
        head -n 5 "$file_name" >"$file_name.tmp"
        mv "$file_name.tmp" "$file_name"
    fi
    return 0
}

if handleWriteLog; then
    echo ""
else
    echo "命令执行失败，进行错误处理"
    exit 1
fi
