// API 관리 클래스
class GeneralAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }
    
    // 모든 무장 조회
    async getGenerals() {
        try {
            const response = await fetch(`${this.baseURL}/generals`);
            return await response.json();
        } catch (error) {
            console.error('무장 목록 조회 실패:', error);
            return [];
        }
    }
    
    // 무장 불러오기
    async loadGeneral(id) {
        try {
            const response = await fetch(`${this.baseURL}/generals/${id}`);
            return await response.json();
        } catch (error) {
            console.error('무장 불러오기 실패:', error);
            throw error;
        }
    }
    
    // 무장 삭제
    async deleteGeneral(id) {
        try {
            const response = await fetch(`${this.baseURL}/generals/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('무장 삭제 실패:', error);
            throw error;
        }
    }
    
    // 모든 무장 삭제
    async clearAllGenerals() {
        try {
            const response = await fetch(`${this.baseURL}/generals`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('전체 삭제 실패:', error);
            throw error;
        }
    }
}

// 테이블 관리 클래스
class GeneralTable {
    constructor(api) {
        this.api = api;
        this.tableBody = document.getElementById('generalsTableBody');
        this.initializeEvents();
        this.updateTable();
    }
    
    initializeEvents() {
        // 전체 삭제 버튼
        document.getElementById('clearAll').addEventListener('click', () => {
            if (confirm('모든 저장된 무장을 삭제하시겠습니까?')) {
                this.clearAllGenerals();
            }
        });
    }
    
    // 테이블 업데이트
    async updateTable() {
        try {
            const savedGenerals = await this.api.getGenerals();
            this.tableBody.innerHTML = '';
            
            if (savedGenerals.length === 0) {
                this.tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">저장된 무장이 없습니다.</td></tr>';
                return;
            }
            
            savedGenerals.forEach(general => {
                const row = document.createElement('tr');
                
                // 최종 스탯 계산
                const finalStats = this.calculateFinalStats(general);
                
                row.innerHTML = `
                    <td>${general.name}</td>
                    <td>${general.grade}등급</td>
                    <td>${general.level}</td>
                    <td>${general.power}</td>
                    <td>${finalStats.command}</td>
                    <td>${finalStats.force}</td>
                    <td>${finalStats.intelligence}</td>
                    <td>${finalStats.politics}</td>
                    <td>${finalStats.charm}</td>
                    <td>
                        <button class="btn btn-small btn-load" onclick="generalTable.loadGeneral(${general.id})">불러오기</button>
                        <button class="btn btn-small btn-delete" onclick="generalTable.deleteGeneral(${general.id})">삭제</button>
                    </td>
                `;
                
                this.tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('테이블 업데이트 실패:', error);
        }
    }
    
    // 무장 불러오기
    async loadGeneral(id) {
        try {
            const generalData = await this.api.loadGeneral(id);
            if (generalData) {
                // JSON 파싱
                generalData.baseStats = JSON.parse(generalData.base_stats);
                generalData.levelupStats = JSON.parse(generalData.levelup_stats);
                generalData.addStats = JSON.parse(generalData.add_stats);
                generalData.skills = JSON.parse(generalData.skills);
                generalData.equipment = JSON.parse(generalData.equipment);
                
                // 로컬 스토리지에 저장하고 메인 페이지로 이동
                localStorage.setItem('loadGeneralData', JSON.stringify(generalData));
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert('무장 불러오기에 실패했습니다.');
        }
    }
    
    // 무장 삭제
    async deleteGeneral(id) {
        if (confirm('이 무장을 삭제하시겠습니까?')) {
            try {
                await this.api.deleteGeneral(id);
                this.updateTable();
            } catch (error) {
                alert('삭제에 실패했습니다.');
            }
        }
    }
    
    // 모든 무장 삭제
    async clearAllGenerals() {
        try {
            await this.api.clearAllGenerals();
            this.updateTable();
        } catch (error) {
            alert('전체 삭제에 실패했습니다.');
        }
    }
    
    // 최종 스탯 계산 (간단 버전)
    calculateFinalStats(general) {
        const level = general.level || 1;
        const grade = general.grade || 1;
        const levelBonus = Math.floor(level * 0.5);
        const gradeBonus = (grade - 1) * 5;
        
        const baseStats = JSON.parse(general.base_stats || '{}');
        const levelupStats = JSON.parse(general.levelup_stats || '{}');
        const addStats = JSON.parse(general.add_stats || '{}');
        
        // 장비 보너스 계산
        let equipmentBonuses = { command: 0, force: 0, intelligence: 0, politics: 0, charm: 0 };
        const equipment = JSON.parse(general.equipment || '{}');
        if (equipment) {
            Object.values(equipment).forEach(equip => {
                if (equip && equip.stats) {
                    Object.keys(equipmentBonuses).forEach(stat => {
                        equipmentBonuses[stat] += equip.stats[stat] || 0;
                    });
                }
            });
        }
        
        return {
            command: Math.min(200, (baseStats.command || 0) + (levelupStats.command || 0) + (addStats.command || 0) + levelBonus + gradeBonus + equipmentBonuses.command),
            force: Math.min(200, (baseStats.force || 0) + (levelupStats.force || 0) + (addStats.force || 0) + levelBonus + gradeBonus + equipmentBonuses.force),
            intelligence: Math.min(200, (baseStats.intelligence || 0) + (levelupStats.intelligence || 0) + (addStats.intelligence || 0) + levelBonus + gradeBonus + equipmentBonuses.intelligence),
            politics: Math.min(200, (baseStats.politics || 0) + (levelupStats.politics || 0) + (addStats.politics || 0) + levelBonus + gradeBonus + equipmentBonuses.politics),
            charm: Math.min(200, (baseStats.charm || 0) + (levelupStats.charm || 0) + (addStats.charm || 0) + levelBonus + gradeBonus + equipmentBonuses.charm)
        };
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const api = new GeneralAPI();
    const generalTable = new GeneralTable(api);
    
    // 전역에서 접근 가능하도록 설정
    window.generalTable = generalTable;
});
