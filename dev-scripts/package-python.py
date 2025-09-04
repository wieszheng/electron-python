#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Python代码打包脚本
用于在Electron应用打包前预处理Python代码
"""

import os
import sys
import shutil
import subprocess
import argparse
from pathlib import Path

# 设置中文字符支持
sys.stdout.reconfigure(encoding='utf-8')

class PythonPackager:
    def __init__(self, source_dir, output_dir, requirements_file):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.requirements_file = Path(requirements_file)
        
    def log(self, message, level="INFO"):
        """打印日志信息"""
        color_codes = {
            "INFO": "\033[92m",  # 绿色
            "WARNING": "\033[93m",  # 黄色
            "ERROR": "\033[91m",  # 红色
            "RESET": "\033[0m"  # 重置颜色
        }
        print(f"{color_codes.get(level, color_codes['INFO'])}[{level}] {message}{color_codes['RESET']}")
    
    def clean_output_dir(self):
        """清理输出目录"""
        if self.output_dir.exists():
            self.log(f"清理输出目录: {self.output_dir}", "INFO")
            shutil.rmtree(self.output_dir)
        
        # 创建输出目录
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def copy_python_files(self):
        """复制Python源代码文件"""
        self.log(f"复制Python文件从 {self.source_dir} 到 {self.output_dir}", "INFO")
        
        # 复制所有Python文件和目录，但排除不需要的文件
        excluded = [
            '__pycache__', 
            '.git', 
            '.venv', 
            'venv', 
            'env', 
            '*.egg-info', 
            'build', 
            'dist',
            '.DS_Store',
            '.gitignore'
        ]
        
        # 复制目录结构
        for root, dirs, files in os.walk(self.source_dir):
            # 过滤掉排除的目录
            dirs[:] = [d for d in dirs if d not in excluded]
            
            # 创建目标目录
            relative_path = os.path.relpath(root, self.source_dir)
            if relative_path == '.':
                target_dir = self.output_dir
            else:
                target_dir = self.output_dir / relative_path
            
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # 复制文件
            for file in files:
                # 过滤掉排除的文件
                if any(file.endswith(ext) for ext in excluded if '*.' in ext):
                    continue
                
                src_file = os.path.join(root, file)
                dst_file = target_dir / file
                
                shutil.copy2(src_file, dst_file)
                self.log(f"复制: {src_file} -> {dst_file}", "INFO")
    
    def install_dependencies(self, use_virtual_env=False):
        """安装Python依赖"""
        if not self.requirements_file.exists():
            self.log(f"未找到依赖文件: {self.requirements_file}", "WARNING")
            return
        
        self.log(f"安装Python依赖从 {self.requirements_file}", "INFO")
        
        if use_virtual_env:
            # 创建虚拟环境
            venv_path = self.output_dir / "venv"
            if sys.platform == 'win32':
                pip_path = venv_path / "Scripts" / "pip.exe"
            else:
                pip_path = venv_path / "bin" / "pip"
            
            # 创建虚拟环境
            self.log(f"创建虚拟环境: {venv_path}", "INFO")
            subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)
            
            # 安装依赖到虚拟环境
            self.log(f"在虚拟环境中安装依赖", "INFO")
            subprocess.run([str(pip_path), "install", "-r", str(self.requirements_file)], check=True)
        else:
            # 直接安装依赖（通常用于开发环境）
            self.log("安装依赖到当前Python环境", "INFO")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(self.requirements_file)], check=True)
    
    def package(self, clean=True, copy_files=True, install_deps=False, use_virtual_env=False):
        """执行打包流程"""
        try:
            self.log("开始Python代码打包流程", "INFO")
            
            if clean:
                self.clean_output_dir()
            
            if copy_files:
                self.copy_python_files()
            
            if install_deps:
                self.install_dependencies(use_virtual_env)
            
            self.log("Python代码打包完成", "INFO")
            return True
        except Exception as e:
            self.log(f"打包过程中发生错误: {str(e)}", "ERROR")
            return False


if __name__ == "__main__":
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="Python代码打包脚本")
    parser.add_argument("--source", default="../backend", help="Python源代码目录")
    parser.add_argument("--output", default="../dist-python", help="打包输出目录")
    parser.add_argument("--requirements", default="../backend/requirements.txt", help="依赖文件路径")
    parser.add_argument("--no-clean", action="store_true", help="不清理输出目录")
    parser.add_argument("--no-copy", action="store_true", help="不复制文件")
    parser.add_argument("--install-deps", action="store_true", help="安装依赖")
    parser.add_argument("--use-venv", action="store_true", help="使用虚拟环境安装依赖")
    
    args = parser.parse_args()
    
    # 创建打包器实例
    packager = PythonPackager(
        source_dir=args.source,
        output_dir=args.output,
        requirements_file=args.requirements
    )
    
    # 执行打包
    success = packager.package(
        clean=not args.no_clean,
        copy_files=not args.no_copy,
        install_deps=args.install_deps,
        use_virtual_env=args.use_venv
    )
    
    # 设置退出码
    sys.exit(0 if success else 1)