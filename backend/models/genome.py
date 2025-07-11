"""
基因组模型
"""

from app import db
from datetime import datetime
import json

class Genome(db.Model):
    """基因组模型"""
    __tablename__ = 'genomes'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)  # 文件名
    filepath = db.Column(db.String(500), nullable=False)  # 文件路径
    file_size = db.Column(db.Integer)  # 文件大小
    file_hash = db.Column(db.String(64))  # 文件MD5哈希
    
    # 基本信息
    sequencing_platform = db.Column(db.String(100))  # 测序平台
    sequencing_date = db.Column(db.Date)  # 测序日期
    assembly_method = db.Column(db.String(100))  # 组装方法
    
    # 质量信息
    total_length = db.Column(db.Integer)  # 基因组总长度
    contig_count = db.Column(db.Integer)  # Contig数量
    n50 = db.Column(db.Integer)  # N50值
    gc_content = db.Column(db.Float)  # GC含量
    coverage = db.Column(db.Float)  # 测序深度
    
    # 注释信息
    gene_count = db.Column(db.Integer)  # 基因数量
    coding_sequences = db.Column(db.Integer)  # 编码序列数
    rrna_count = db.Column(db.Integer)  # rRNA数量
    trna_count = db.Column(db.Integer)  # tRNA数量
    
    # 分型信息
    mlst_st = db.Column(db.String(50))  # MLST型别
    serotype = db.Column(db.String(50))  # 血清型
    virulence_genes = db.Column(db.Text)  # 毒力基因 (JSON格式)
    resistance_genes = db.Column(db.Text)  # 耐药基因 (JSON格式)
    plasmids = db.Column(db.Text)  # 质粒信息 (JSON格式)
    
    # 关联信息
    strain_id = db.Column(db.Integer, db.ForeignKey('strains.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 分析任务
    analysis_tasks = db.relationship('AnalysisTask', backref='genome', lazy=True)
    
    def set_virulence_genes(self, genes_list):
        """设置毒力基因"""
        self.virulence_genes = json.dumps(genes_list) if genes_list else None
    
    def get_virulence_genes(self):
        """获取毒力基因"""
        return json.loads(self.virulence_genes) if self.virulence_genes else []
    
    def set_resistance_genes(self, genes_list):
        """设置耐药基因"""
        self.resistance_genes = json.dumps(genes_list) if genes_list else None
    
    def get_resistance_genes(self):
        """获取耐药基因"""
        return json.loads(self.resistance_genes) if self.resistance_genes else []
    
    def set_plasmids(self, plasmids_list):
        """设置质粒信息"""
        self.plasmids = json.dumps(plasmids_list) if plasmids_list else None
    
    def get_plasmids(self):
        """获取质粒信息"""
        return json.loads(self.plasmids) if self.plasmids else []
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'filename': self.filename,
            'file_size': self.file_size,
            'sequencing_platform': self.sequencing_platform,
            'sequencing_date': self.sequencing_date.isoformat() if self.sequencing_date else None,
            'assembly_method': self.assembly_method,
            'total_length': self.total_length,
            'contig_count': self.contig_count,
            'n50': self.n50,
            'gc_content': self.gc_content,
            'coverage': self.coverage,
            'gene_count': self.gene_count,
            'coding_sequences': self.coding_sequences,
            'rrna_count': self.rrna_count,
            'trna_count': self.trna_count,
            'mlst_st': self.mlst_st,
            'serotype': self.serotype,
            'virulence_genes': self.get_virulence_genes(),
            'resistance_genes': self.get_resistance_genes(),
            'plasmids': self.get_plasmids(),
            'strain_id': self.strain_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Genome {self.filename}>' 