"""
菌株模型
"""

from app import db
from datetime import datetime

class Strain(db.Model):
    """菌株模型"""
    __tablename__ = 'strains'
    
    id = db.Column(db.Integer, primary_key=True)
    strain_id = db.Column(db.String(100), unique=True, nullable=False)  # 菌株编号
    species = db.Column(db.String(100), nullable=False)  # 菌种
    source = db.Column(db.String(200))  # 来源
    isolation_date = db.Column(db.Date)  # 分离日期
    isolation_site = db.Column(db.String(200))  # 分离部位
    sample_type = db.Column(db.String(100))  # 样本类型
    
    # 流行病学信息
    patient_id = db.Column(db.String(100))  # 患者ID
    patient_age = db.Column(db.Integer)  # 患者年龄
    patient_gender = db.Column(db.String(10))  # 患者性别
    hospital = db.Column(db.String(200))  # 医院
    department = db.Column(db.String(100))  # 科室
    region = db.Column(db.String(100))  # 地区
    
    # 临床信息
    diagnosis = db.Column(db.Text)  # 诊断
    antibiotic_treatment = db.Column(db.Text)  # 抗生素治疗
    outcome = db.Column(db.String(50))  # 结局
    
    # 系统信息
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联的基因组数据
    genomes = db.relationship('Genome', backref='strain', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'strain_id': self.strain_id,
            'species': self.species,
            'source': self.source,
            'isolation_date': self.isolation_date.isoformat() if self.isolation_date else None,
            'isolation_site': self.isolation_site,
            'sample_type': self.sample_type,
            'patient_id': self.patient_id,
            'patient_age': self.patient_age,
            'patient_gender': self.patient_gender,
            'hospital': self.hospital,
            'department': self.department,
            'region': self.region,
            'diagnosis': self.diagnosis,
            'antibiotic_treatment': self.antibiotic_treatment,
            'outcome': self.outcome,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'genome_count': len(self.genomes)
        }
    
    def __repr__(self):
        return f'<Strain {self.strain_id}>' 