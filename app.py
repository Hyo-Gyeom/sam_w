#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
삼국지 무장 전투력 계산기 Flask 웹 서버
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
from calculate_power import PowerCalculator

app = Flask(__name__)
CORS(app)

# 전역 계산기 인스턴스
calculator = PowerCalculator()

# 데이터베이스 초기화
def init_db():
    """데이터베이스 테이블 생성"""
    conn = sqlite3.connect('generals.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS generals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            grade INTEGER,
            level INTEGER,
            power INTEGER,
            base_stats TEXT,
            levelup_stats TEXT,
            add_stats TEXT,
            skills TEXT,
            equipment TEXT,
            saved_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 모든 무장 조회
@app.route('/api/generals', methods=['GET'])
def get_generals():
    """저장된 모든 무장 조회"""
    try:
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM generals ORDER BY saved_at DESC')
        generals = cursor.fetchall()
        
        conn.close()
        
        # 데이터 포맷팅
        result = []
        for general in generals:
            result.append({
                'id': general[0],
                'name': general[1],
                'grade': general[2],
                'level': general[3],
                'power': general[4],
                'baseStats': json.loads(general[5]) if general[5] else {},
                'levelupStats': json.loads(general[6]) if general[6] else {},
                'addStats': json.loads(general[7]) if general[7] else {},
                'skills': json.loads(general[8]) if general[8] else {},
                'equipment': json.loads(general[9]) if general[9] else {},
                'savedAt': general[10]
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 특정 무장 조회
@app.route('/api/generals/<int:general_id>', methods=['GET'])
def get_general(general_id):
    """특정 무장 조회"""
    try:
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM generals WHERE id = ?', (general_id,))
        general = cursor.fetchone()
        
        conn.close()
        
        if not general:
            return jsonify({'error': '무장을 찾을 수 없습니다.'}), 404
        
        return jsonify({
            'id': general[0],
            'name': general[1],
            'grade': general[2],
            'level': general[3],
            'power': general[4],
            'baseStats': json.loads(general[5]) if general[5] else {},
            'levelupStats': json.loads(general[6]) if general[6] else {},
            'addStats': json.loads(general[7]) if general[7] else {},
            'skills': json.loads(general[8]) if general[8] else {},
            'equipment': json.loads(general[9]) if general[9] else {},
            'savedAt': general[10]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 무장 저장
@app.route('/api/generals', methods=['POST'])
def save_general():
    """무장 저장"""
    try:
        data = request.json
        saved_at = datetime.now().isoformat()
        
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO generals (name, grade, level, power, base_stats, levelup_stats, add_stats, skills, equipment, saved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('grade'),
            data.get('level'),
            data.get('power'),
            json.dumps(data.get('baseStats', {})),
            json.dumps(data.get('levelupStats', {})),
            json.dumps(data.get('addStats', {})),
            json.dumps(data.get('skills', {})),
            json.dumps(data.get('equipment', {})),
            saved_at
        ))
        
        general_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': general_id,
            'message': '무장이 성공적으로 저장되었습니다.'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 무장 수정
@app.route('/api/generals/<int:general_id>', methods=['PUT'])
def update_general(general_id):
    """무장 수정"""
    try:
        data = request.json
        saved_at = datetime.now().isoformat()
        
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE generals SET name = ?, grade = ?, level = ?, power = ?, base_stats = ?, levelup_stats = ?, add_stats = ?, skills = ?, equipment = ?, saved_at = ?
            WHERE id = ?
        ''', (
            data.get('name'),
            data.get('grade'),
            data.get('level'),
            data.get('power'),
            json.dumps(data.get('baseStats', {})),
            json.dumps(data.get('levelupStats', {})),
            json.dumps(data.get('addStats', {})),
            json.dumps(data.get('skills', {})),
            json.dumps(data.get('equipment', {})),
            saved_at,
            general_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': '무장이 업데이트되었습니다.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 무장 삭제
@app.route('/api/generals/<int:general_id>', methods=['DELETE'])
def delete_general(general_id):
    """무장 삭제"""
    try:
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM generals WHERE id = ?', (general_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': '무장이 삭제되었습니다.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 모든 무장 삭제
@app.route('/api/generals', methods=['DELETE'])
def delete_all_generals():
    """모든 무장 삭제"""
    try:
        conn = sqlite3.connect('generals.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM generals')
        conn.commit()
        conn.close()
        
        return jsonify({'message': '모든 무장이 삭제되었습니다.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 전투력 계산 API (머신러닝 기반)
@app.route('/api/calculate-power', methods=['POST'])
def calculate_power():
    """전투력 계산 (머신러닝)"""
    try:
        data = request.json
        
        # 실제 전투력이 제공된 경우 학습 데이터 추가
        if data.get('actualPower'):
            calculator.add_learning_data(data, data['actualPower'])
            calculator.train_model()
            calculator.save_data()
        
        # 전투력 예측
        predicted_power = calculator.predict_power(data)
        
        # 특성 중요도
        feature_importance = calculator.get_feature_importance()
        
        return jsonify({
            'success': True,
            'result': {
                'estimatedPower': predicted_power,
                'featureImportance': feature_importance,
                'learningDataCount': len(calculator.learning_data),
                'isTrained': calculator.is_trained
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 정적 파일 서빙
@app.route('/')
def index():
    """메인 페이지"""
    return send_from_directory('.', 'main.html')

@app.route('/data-input')
def data_input_page():
    """데이터 입력 페이지"""
    return send_from_directory('.', 'data_input.html')

@app.route('/list')
def list_page():
    """목록 페이지"""
    return send_from_directory('.', 'list.html')

@app.route('/<path:filename>')
def static_files(filename):
    """정적 파일 서빙"""
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # 데이터베이스 초기화
    init_db()
    
    # 서버 시작
    print("삼국지 무장 전투력 계산기 서버가 시작됩니다...")
    print("메인 페이지: http://localhost:5000")
    print("계산기 페이지: http://localhost:5000/calculator")
    print("목록 페이지: http://localhost:5000/list")
    
    app.run(debug=True, host='0.0.0.0', port=5000)