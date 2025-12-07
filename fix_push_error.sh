#!/bin/bash
# Script để xử lý lỗi "src refspec main does not match any"

echo "========================================"
echo "Kiểm tra và sửa lỗi Git Push"
echo "========================================"
echo ""

# Kiểm tra xem có commit nào chưa
echo "1. Kiểm tra commits..."
COMMIT_COUNT=$(git log --oneline 2>/dev/null | wc -l)
if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo "   ⚠️  Chưa có commit nào!"
    echo "   Đang thêm file và commit..."
    git add .
    git commit -m "Add Webhoctructuyen project"
    if [ $? -eq 0 ]; then
        echo "   ✅ Đã commit thành công!"
    else
        echo "   ❌ Lỗi khi commit. Kiểm tra Git identity:"
        echo "      git config --global user.name"
        echo "      git config --global user.email"
        exit 1
    fi
else
    echo "   ✅ Đã có $COMMIT_COUNT commit(s)"
    git log --oneline -5
fi
echo ""

# Kiểm tra branch hiện tại
echo "2. Kiểm tra branch hiện tại..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [ -z "$CURRENT_BRANCH" ]; then
    echo "   ⚠️  Chưa có branch nào, đang tạo branch main..."
    git branch -M main
    CURRENT_BRANCH="main"
else
    echo "   Branch hiện tại: $CURRENT_BRANCH"
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "   Đang đổi tên branch thành main..."
        git branch -M main
        CURRENT_BRANCH="main"
    fi
fi
echo ""

# Kiểm tra remote
echo "3. Kiểm tra remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "   ⚠️  Chưa có remote, đang thêm..."
    git remote add origin https://github.com/hangtr29/Web-vnl.git
else
    echo "   Remote: $REMOTE_URL"
fi
echo ""

# Thử push
echo "4. Đang push lên GitHub..."
echo "   Branch: $CURRENT_BRANCH"
git push -u origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ Push thành công!"
    echo "Repository: https://github.com/hangtr29/Web-vnl"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "❌ Push thất bại!"
    echo ""
    echo "Có thể repository trên GitHub đã có code."
    echo "Thử chạy:"
    echo "  git pull origin main --allow-unrelated-histories"
    echo "  git push -u origin main"
    echo "========================================"
fi

