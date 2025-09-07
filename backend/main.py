from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os
import argparse

# 创建FastAPI应用实例
app = FastAPI(
    title="Electron Python App Backend",
    description="Python backend for Electron desktop application",
    version="1.0.0"
)

# 添加CORS中间件，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在实际生产环境中应该限制为特定的来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义请求体模型
class CalculateRequest(BaseModel):
    a: float
    b: float
    operation: str  # add, subtract, multiply, divide

# 定义响应体模型
class CalculateResponse(BaseModel):
    result: float

# 根端点
@app.get("/")
def read_root():
    return {"message": "Welcome to Electron Python App Backend!", "version": "1.0.0"}

# 健康检查端点
@app.get("/api/health")
def health_check():
    """健康检查端点，用于测试API连接"""
    return {
        "status": "healthy",
        "message": "Backend service is running normally",
        "timestamp": "2025-09-07"
    }

# 计算端点示例
@app.post("/calculate", response_model=CalculateResponse)
def calculate(request: CalculateRequest):
    """执行简单的数学计算"""
    if request.operation == "add":
        result = request.a + request.b
    elif request.operation == "subtract":
        result = request.a - request.b
    elif request.operation == "multiply":
        result = request.a * request.b
    elif request.operation == "divide":
        if request.b == 0:
            raise HTTPException(status_code=400, detail="除数不能为零")
        result = request.a / request.b
    else:
        raise HTTPException(status_code=400, detail="无效的操作")
    
    return {"result": result}

# 获取系统信息端点
@app.get("/system-info")
def get_system_info():
    """获取系统基本信息"""
    info = {
        "python_version": sys.version,
        "platform": sys.platform,
        "os": os.name,
        "cwd": os.getcwd()
    }
    return info

# 文件操作示例端点
@app.post("/file-content")
def get_file_content(file_path: str):
    """读取文件内容（注意：这是一个示例，在实际应用中需要进行安全检查）"""
    try:
        # 简单的安全检查，防止路径遍历攻击
        if ".." in file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=403, detail="无效的文件路径")
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 启动服务器
if __name__ == "__main__":
    # 在实际应用中，host可以设置为"127.0.0.1"以限制只能从本地访问
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=args.port,
        reload=True,  # 在开发环境中启用热重载
    )