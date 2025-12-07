#!/bin/bash
# Script để cấu hình Git identity

echo "========================================"
echo "Cấu hình Git Identity"
echo "========================================"
echo ""

# Kiểm tra xem đã cấu hình chưa
if [ -z "$(git config --global user.name)" ]; then
    echo "Chưa có cấu hình user.name"
    echo ""
    echo "Vui lòng chạy các lệnh sau (thay thông tin của bạn):"
    echo ""
    echo "git config --global user.name \"Tên của bạn\""
    echo "git config --global user.email \"email@example.com\""
    echo ""
    echo "Hoặc chỉ cho repository này:"
    echo "git config user.name \"Tên của bạn\""
    echo "git config user.email \"email@example.com\""
    echo ""
else
    echo "Đã cấu hình:"
    echo "  Name:  $(git config --global user.name)"
    echo "  Email: $(git config --global user.email)"
    echo ""
fi

echo "========================================"

