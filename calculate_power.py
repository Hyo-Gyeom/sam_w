#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
삼국지 무장 전투력 계산 엔진
머신러닝 기반 패턴 학습 및 전투력 추정
"""

import json
import sys
import pickle
import os
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import pandas as pd

class PowerCalculator:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        self.data_file = 'learning_data.pkl'
        self.model_file = 'power_model.pkl'
        self.load_data()
    
    def load_data(self):
        """저장된 학습 데이터와 모델 로드"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'rb') as f:
                self.learning_data = pickle.load(f)
        else:
            self.learning_data = []
        
        if os.path.exists(self.model_file):
            with open(self.model_file, 'rb') as f:
                self.model = pickle.load(f)
                self.is_trained = True
    
    def save_data(self):
        """학습 데이터와 모델 저장"""
        with open(self.data_file, 'wb') as f:
            pickle.dump(self.learning_data, f)
        
        if self.is_trained:
            with open(self.model_file, 'wb') as f:
                pickle.dump(self.model, f)
    
    def extract_features(self, data):
        """입력 데이터에서 특성 추출"""
        features = []
        
        # 기본 특성
        features.extend([
            data['level'],
            data['generalGrade'],
            data['baseStats']['command'],
            data['baseStats']['force'],
            data['baseStats']['intelligence'],
            data['baseStats']['politics'],
            data['baseStats']['charm']
        ])
        
        # 총 스탯
        total_stats = sum(data['baseStats'].values())
        features.append(total_stats)
        
        # 스킬 개수
        skill_count = sum(1 for skill in data['skills'].values() if skill and skill.strip())
        features.append(skill_count)
        
        # 장비 등급 합계
        equipment_grade = sum(item.get('grade', 0) for item in data['equipment'].values())
        features.append(equipment_grade)
        
        # 장비 개수
        equipment_count = sum(1 for item in data['equipment'].values() if item.get('grade', 0) > 0)
        features.append(equipment_count)
        
        # 상호작용 특성
        features.extend([
            data['level'] * data['generalGrade'],  # 레벨 × 등급
            total_stats * data['level'],  # 총 스탯 × 레벨
            equipment_grade * data['level'],  # 장비 등급 × 레벨
            skill_count * data['level']  # 스킬 개수 × 레벨
        ])
        
        return np.array(features)
    
    def add_learning_data(self, data, actual_power):
        """새로운 학습 데이터 추가"""
        features = self.extract_features(data)
        self.learning_data.append({
            'features': features,
            'actual_power': actual_power,
            'data': data
        })
        
        # 데이터가 너무 많아지면 오래된 것부터 제거 (최대 1000개)
        if len(self.learning_data) > 1000:
            self.learning_data = self.learning_data[-1000:]
        
        self.is_trained = False  # 모델 재학습 필요
    
    def train_model(self):
        """모델 학습"""
        if len(self.learning_data) < 5:  # 최소 5개 데이터 필요
            return False
        
        # 특성과 타겟 분리
        X = np.array([item['features'] for item in self.learning_data])
        y = np.array([item['actual_power'] for item in self.learning_data])
        
        # 학습/검증 분할
        if len(X) > 10:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # 모델 학습
            self.model.fit(X_train, y_train)
            
            # 성능 평가
            y_pred = self.model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"모델 성능 - MSE: {mse:.2f}, R²: {r2:.2f}")
        else:
            # 데이터가 적으면 전체 데이터로 학습
            self.model.fit(X, y)
        
        self.is_trained = True
        return True
    
    def predict_power(self, data):
        """전투력 예측"""
        if not self.is_trained:
            # 학습되지 않은 경우 기본 공식 사용
            return self._basic_calculation(data)
        
        features = self.extract_features(data)
        features = features.reshape(1, -1)
        
        predicted_power = self.model.predict(features)[0]
        return max(0, int(predicted_power))  # 음수 방지
    
    def _basic_calculation(self, data):
        """기본 계산 공식 (학습 데이터가 없을 때)"""
        level = data['level']
        grade = data['generalGrade']
        total_stats = sum(data['baseStats'].values())
        skill_count = sum(1 for skill in data['skills'].values() if skill and skill.strip())
        equipment_grade = sum(item.get('grade', 0) for item in data['equipment'].values())
        
        # 기본 공식
        power = (
            level * 10 +  # 레벨당 10
            grade * 5 +   # 등급당 5
            total_stats * 0.5 +  # 스탯당 0.5
            skill_count * 20 +   # 스킬당 20
            equipment_grade * 15  # 장비 등급당 15
        )
        
        return int(power)
    
    def get_feature_importance(self):
        """특성 중요도 반환"""
        if not self.is_trained:
            return {}
        
        feature_names = [
            'level', 'generalGrade', 'command', 'force', 'intelligence', 
            'politics', 'charm', 'totalStats', 'skillCount', 'equipmentGrade',
            'equipmentCount', 'level_grade', 'stats_level', 'equipment_level', 'skill_level'
        ]
        
        importance = self.model.feature_importances_
        return dict(zip(feature_names, importance))

def main():
    """메인 함수 - Node.js에서 호출됨"""
    try:
        # JSON 데이터 읽기 (stdin에서 읽기, UTF-8 인코딩)
        input_str = sys.stdin.read()
        input_data = json.loads(input_str)
        
        calculator = PowerCalculator()
        
        # 실제 전투력이 제공된 경우 학습 데이터 추가
        if 'actualPower' in input_data and input_data['actualPower']:
            calculator.add_learning_data(input_data, input_data['actualPower'])
            calculator.train_model()
            calculator.save_data()
        
        # 전투력 예측
        predicted_power = calculator.predict_power(input_data)
        
        # 특성 중요도
        feature_importance = calculator.get_feature_importance()
        
        # 결과 반환
        result = {
            'success': True,
            'predicted_power': predicted_power,
            'feature_importance': feature_importance,
            'learning_data_count': len(calculator.learning_data),
            'is_trained': calculator.is_trained
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()
