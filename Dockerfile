# 使用官方Python运行时作为父镜像
FROM python:3.9-slim-buster

# 设置工作目录
WORKDIR /app

# 将当前目录内容复制到容器的/app中
COPY . /app

# 安装所有依赖
RUN pip install --no-cache-dir -r requirements.txt

# 暴露端口（Cloud Run会注入PORT环境变量，我们在此使用默认值8080）
ENV PORT 8080

# 运行Flask应用程序
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app