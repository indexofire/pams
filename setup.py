"""
PAMS 项目安装脚本
"""

from setuptools import setup, find_packages
import os
import sys

def init_database():
    """初始化数据库"""
    print("初始化PAMS数据库...")
    from src.app import app, db
    with app.app_context():
        db.create_all()
        print("数据库初始化完成！")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "init_db":
        init_database()
    else:
        setup(
            name="pams",
            version="0.1.0",
            description="实验室细菌基因组管理工具",
            long_description=open("README.md", encoding="utf-8").read(),
            long_description_content_type="text/markdown",
            author="PAMS Development Team",
            packages=find_packages(),
            install_requires=[
                line.strip() 
                for line in open("requirements.txt").readlines()
                if not line.startswith("#") and line.strip()
            ],
            classifiers=[
                "Development Status :: 3 - Alpha",
                "Intended Audience :: Science/Research",
                "License :: OSI Approved :: MIT License",
                "Programming Language :: Python :: 3",
                "Programming Language :: Python :: 3.8",
                "Programming Language :: Python :: 3.9",
                "Programming Language :: Python :: 3.10",
                "Topic :: Scientific/Engineering :: Bio-Informatics",
            ],
            python_requires=">=3.8",
        ) 