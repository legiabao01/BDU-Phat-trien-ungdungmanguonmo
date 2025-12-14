# 📝 Coding Convention - Code Đơ

Tài liệu mô tả các quy tắc coding convention được áp dụng trong dự án.

## 1. QUY TẮC ĐẶT TÊN

### 1.1. Python (Backend)

#### Variables và Functions
- **Snake_case** cho biến và hàm
- Tên phải mô tả rõ ràng mục đích

```python
# ✅ Đúng
user_id = 1
def get_user_by_id(user_id):
    pass

# ❌ Sai
userId = 1
def getUserById(userId):
    pass
```

#### Classes
- **PascalCase** cho tên class
- Tên class phải là danh từ

```python
# ✅ Đúng
class User(Base):
    pass

class CourseContent(Base):
    pass

# ❌ Sai
class user(Base):
    pass
```

#### Constants
- **UPPER_SNAKE_CASE** cho constants

```python
# ✅ Đúng
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
DEFAULT_PAGE_SIZE = 10

# ❌ Sai
maxFileSize = 10 * 1024 * 1024
```

#### Database Models
- Tên model: **PascalCase**
- Tên bảng: **snake_case** (tương ứng với tên model)

```python
# ✅ Đúng
class User(Base):
    __tablename__ = "users"
    
class KhoaHoc(Base):
    __tablename__ = "khoa_hoc"
```

### 1.2. JavaScript/React (Frontend)

#### Variables và Functions
- **camelCase** cho biến và hàm

```javascript
// ✅ Đúng
const userId = 1;
function getUserById(userId) {
    return null;
}

// ❌ Sai
const user_id = 1;
function get_user_by_id(user_id) {
    return null;
}
```

#### Components
- **PascalCase** cho React components
- Tên file component: **PascalCase.jsx**

```javascript
// ✅ Đúng
// File: UserProfile.jsx
function UserProfile() {
    return <div>User Profile</div>;
}

// ❌ Sai
// File: userProfile.jsx
function userProfile() {
    return <div>User Profile</div>;
}
```

#### Constants
- **UPPER_SNAKE_CASE** cho constants

```javascript
// ✅ Đúng
const API_BASE_URL = 'http://localhost:8001';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ❌ Sai
const apiBaseUrl = 'http://localhost:8001';
```

### 1.3. Database

#### Tables
- **snake_case** cho tên bảng
- Số ít (singular) hoặc số nhiều (plural) tùy theo quy ước

```sql
-- ✅ Đúng
CREATE TABLE users (...);
CREATE TABLE khoa_hoc (...);
CREATE TABLE dang_ky_khoa_hoc (...);

-- ❌ Sai
CREATE TABLE Users (...);
CREATE TABLE KhoaHoc (...);
```

#### Columns
- **snake_case** cho tên cột

```sql
-- ✅ Đúng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    ho_ten VARCHAR(255),
    created_at TIMESTAMP
);

-- ❌ Sai
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    Email VARCHAR(255),
    hoTen VARCHAR(255),
    createdAt TIMESTAMP
);
```

## 2. QUY TẮC ĐỊNH DẠNG (FORMATTING)

### 2.1. Python

#### Indentation
- Sử dụng **4 spaces** (không dùng tabs)
- Mỗi level indentation = 4 spaces

```python
# ✅ Đúng
def process_user(user_id):
    user = get_user(user_id)
    if user:
        return user.name
    return None

# ❌ Sai (2 spaces hoặc tabs)
def process_user(user_id):
  user = get_user(user_id)
  if user:
    return user.name
```

#### Line Length
- Tối đa **100 characters** mỗi dòng
- Nếu dài hơn, xuống dòng với indentation

```python
# ✅ Đúng
def create_course(
    ten_khoa_hoc: str,
    mo_ta: str,
    gia: float,
    giao_vien_id: int
):
    pass

# ❌ Sai
def create_course(ten_khoa_hoc: str, mo_ta: str, gia: float, giao_vien_id: int):
    pass
```

#### Imports
- Sắp xếp imports theo thứ tự:
  1. Standard library
  2. Third-party packages
  3. Local imports

```python
# ✅ Đúng
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.security import get_current_user
from ..db.session import get_db
from ..models.user import User
from ..schemas.user import UserOut

# ❌ Sai (không sắp xếp)
from fastapi import APIRouter
import os
from ..models.user import User
from datetime import datetime
```

#### Blank Lines
- 2 blank lines giữa các top-level definitions (classes, functions)
- 1 blank line giữa các methods trong class

```python
# ✅ Đúng
class User(Base):
    def __init__(self):
        pass
    
    def get_name(self):
        pass


class Course(Base):
    pass
```

### 2.2. JavaScript/React

#### Indentation
- Sử dụng **2 spaces** (quy ước React)

```javascript
// ✅ Đúng
function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  return (
    <div>
      <h1>User Profile</h1>
    </div>
  );
}

// ❌ Sai (4 spaces)
function UserProfile() {
    const [user, setUser] = useState(null);
}
```

#### Semicolons
- Sử dụng semicolons ở cuối mỗi statement

```javascript
// ✅ Đúng
const name = 'John';
const age = 25;

// ❌ Sai
const name = 'John'
const age = 25
```

#### Quotes
- Sử dụng **single quotes** cho strings (hoặc double quotes, nhưng phải nhất quán)

```javascript
// ✅ Đúng
const message = 'Hello World';
const apiUrl = 'http://localhost:8001';

// ❌ Sai (không nhất quán)
const message = 'Hello World';
const apiUrl = "http://localhost:8001";
```

## 3. QUY TẮC COMMENT

### 3.1. Python

#### Docstrings
- Sử dụng docstrings cho functions và classes
- Format: **Google style** hoặc **NumPy style**

```python
# ✅ Đúng
def get_user_by_id(user_id: int) -> Optional[User]:
    """
    Lấy thông tin user theo ID.
    
    Args:
        user_id: ID của user cần lấy
        
    Returns:
        User object nếu tìm thấy, None nếu không tìm thấy
        
    Raises:
        ValueError: Nếu user_id không hợp lệ
    """
    if user_id <= 0:
        raise ValueError("user_id must be positive")
    return db.query(User).filter(User.id == user_id).first()
```

#### Inline Comments
- Sử dụng inline comments để giải thích logic phức tạp
- Comment phải giải thích "tại sao", không phải "cái gì"

```python
# ✅ Đúng
# Kiểm tra xem user đã đăng ký khóa học chưa để tránh duplicate
if enrollment:
    return {"error": "Already enrolled"}

# ❌ Sai (comment không cần thiết)
# Gán giá trị cho biến
user_id = 1
```

### 3.2. JavaScript/React

#### Function Comments
- Sử dụng JSDoc cho functions

```javascript
// ✅ Đúng
/**
 * Lấy thông tin user từ API
 * @param {number} userId - ID của user
 * @returns {Promise<User>} User object
 */
async function fetchUser(userId) {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
}
```

#### Component Comments
- Comment cho các components phức tạp

```javascript
// ✅ Đúng
/**
 * Component hiển thị danh sách khóa học
 * - Hỗ trợ search và filter
 * - Pagination tự động
 */
function CourseList() {
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);
  
  return (
    <div>
      {/* Search bar */}
      <SearchBar onSearch={handleSearch} />
      
      {/* Course grid */}
      <div className="course-grid">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

## 4. QUY TẮC CẤU TRÚC CODE

### 4.1. File Organization

#### Python Files
```python
# 1. Imports (standard, third-party, local)
import os
from fastapi import APIRouter
from ..models.user import User

# 2. Constants
MAX_FILE_SIZE = 10 * 1024 * 1024

# 3. Classes
class UserService:
    pass

# 4. Functions
def helper_function():
    pass

# 5. Main code
if __name__ == "__main__":
    pass
```

#### React Components
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Constants
const API_URL = 'http://localhost:8001';

// 3. Component
function MyComponent() {
  // 3.1. Hooks (useState, useEffect, etc.)
  const [state, setState] = useState(null);
  
  // 3.2. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 3.3. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3.4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Export
export default MyComponent;
```

### 4.2. Function/Method Organization

```python
# ✅ Đúng - Thứ tự logic
def process_payment(payment_id: int):
    # 1. Validation
    if payment_id <= 0:
        raise ValueError("Invalid payment_id")
    
    # 2. Fetch data
    payment = get_payment(payment_id)
    if not payment:
        return None
    
    # 3. Business logic
    if payment.status == "completed":
        return payment
    
    # 4. Update database
    payment.status = "completed"
    db.commit()
    
    # 5. Return result
    return payment
```

## 5. QUY TẮC XỬ LÝ LỖI

### 5.1. Python

```python
# ✅ Đúng - Sử dụng exceptions
def get_user(user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ❌ Sai - Return None hoặc error code
def get_user(user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None  # Không rõ ràng
    return user
```

### 5.2. JavaScript

```javascript
// ✅ Đúng - Sử dụng try-catch
async function fetchUser(userId) {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
}

// ❌ Sai - Không xử lý lỗi
async function fetchUser(userId) {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data; // Có thể throw error
}
```

## 6. QUY TẮC DATABASE

### 6.1. SQL Queries

```sql
-- ✅ Đúng - Format rõ ràng
SELECT 
    u.id,
    u.email,
    u.ho_ten,
    COUNT(e.id) AS so_khoa_hoc
FROM users u
LEFT JOIN dang_ky_khoa_hoc e ON u.id = e.user_id
WHERE u.vai_tro = 'student'
GROUP BY u.id, u.email, u.ho_ten
ORDER BY so_khoa_hoc DESC;

-- ❌ Sai - Khó đọc
SELECT u.id,u.email,u.ho_ten,COUNT(e.id) AS so_khoa_hoc FROM users u LEFT JOIN dang_ky_khoa_hoc e ON u.id=e.user_id WHERE u.vai_tro='student' GROUP BY u.id,u.email,u.ho_ten ORDER BY so_khoa_hoc DESC;
```

### 6.2. Migration Files

- Tên file: `YYYYMMDD_description.sql` hoặc `description.sql`
- Mỗi migration phải có comment mô tả

```sql
-- Migration: Thêm cột so_du vào bảng users
-- Date: 2024-01-15
-- Description: Thêm cột số dư ví điện tử cho người dùng

ALTER TABLE users
ADD COLUMN so_du DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN users.so_du IS 'Số dư ví điện tử của người dùng';
```

## 7. QUY TẮC GIT COMMIT

### 7.1. Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Formatting, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Các thay đổi khác

**Examples:**
```bash
# ✅ Đúng
feat: Thêm chức năng thanh toán ví điện tử

fix: Sửa lỗi không hiển thị điểm bài tập

docs: Cập nhật README với hướng dẫn deploy

# ❌ Sai
update code
fix bug
new feature
```

## 8. TÓM TẮT

### Python
- ✅ Snake_case cho variables/functions
- ✅ PascalCase cho classes
- ✅ 4 spaces indentation
- ✅ Docstrings cho functions/classes
- ✅ Sắp xếp imports theo thứ tự

### JavaScript/React
- ✅ camelCase cho variables/functions
- ✅ PascalCase cho components
- ✅ 2 spaces indentation
- ✅ JSDoc comments
- ✅ Semicolons ở cuối statements

### Database
- ✅ snake_case cho tables/columns
- ✅ Comments cho migrations
- ✅ Format SQL queries rõ ràng

### Git
- ✅ Commit messages theo format chuẩn
- ✅ Descriptive commit messages

---

**Lưu ý:** Tất cả code trong dự án phải tuân thủ các quy tắc trên để đảm bảo tính nhất quán và dễ đọc.

