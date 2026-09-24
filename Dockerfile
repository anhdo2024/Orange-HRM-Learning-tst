# Image nền đã có sẵn Chrome và mọi thư viện hệ thống cần thiết
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy file khai báo phụ thuộc TRƯỚC -- xem giải thích ở 2.3
COPY package*.json ./

# Cài phụ thuộc
RUN npm ci

# Copy toàn bộ code còn lại
COPY . .

# Lệnh mặc định khi container chạy
CMD ["npm", "run", "wdio"]