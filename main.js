// 삼국지 무장 전투력 계산기 JavaScript
class GeneralPowerCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // 장수 기본 정보
        this.generalName = document.getElementById('generalName');
        this.generalGrade = document.getElementById('generalGrade');
        this.level = document.getElementById('level');
        
        // 기본 스탯
        this.command = document.getElementById('command');
        this.force = document.getElementById('force');
        this.intelligence = document.getElementById('intelligence');
        this.politics = document.getElementById('politics');
        this.charm = document.getElementById('charm');
        
        // 스킬
        this.skill1 = document.getElementById('skill1');
        this.skill2 = document.getElementById('skill2');
        this.skill3 = document.getElementById('skill3');
        
        // 장비 이름
        this.weaponName = document.getElementById('weaponName');
        this.armorName = document.getElementById('armorName');
        this.helmetName = document.getElementById('helmetName');
        this.shieldName = document.getElementById('shieldName');
        this.horseName = document.getElementById('horseName');
        this.bootsName = document.getElementById('bootsName');
        
        // 결과 표시
        this.totalCommand = document.getElementById('totalCommand');
        this.totalForce = document.getElementById('totalForce');
        this.totalIntelligence = document.getElementById('totalIntelligence');
        this.totalPolitics = document.getElementById('totalPolitics');
        this.totalCharm = document.getElementById('totalCharm');
        this.totalPower = document.getElementById('totalPower');
        this.powerRank = document.getElementById('powerRank');
    }

    bindEvents() {
        // 모든 입력 요소에 실시간 계산 이벤트 바인딩
        const allInputs = [
            this.generalName, this.generalGrade, this.level,
            this.command, this.force, this.intelligence, this.politics, this.charm,
            this.skill1, this.skill2, this.skill3,
            this.weaponName, this.armorName, this.helmetName, this.shieldName, this.horseName, this.bootsName
        ];
        
        allInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculatePower());
                input.addEventListener('change', () => this.calculatePower());
            }
        });
    }

    async calculatePower() {
        // 입력 데이터 수집
        const data = {
            generalName: this.generalName.value,
            generalGrade: parseInt(this.generalGrade.value) || 1,
            level: parseInt(this.level.value) || 1,
            baseStats: {
                command: parseInt(this.command.value) || 0,
                force: parseInt(this.force.value) || 0,
                intelligence: parseInt(this.intelligence.value) || 0,
                politics: parseInt(this.politics.value) || 0,
                charm: parseInt(this.charm.value) || 0
            },
            skills: {
                skill1: this.skill1.value,
                skill2: this.skill2.value,
                skill3: this.skill3.value
            },
            equipment: {
                weapon: { name: this.weaponName.value, grade: 5 },
                armor: { name: this.armorName.value, grade: 5 },
                helmet: { name: this.helmetName.value, grade: 5 },
                shield: { name: this.shieldName.value, grade: 5 },
                horse: { name: this.horseName.value, grade: 5 },
                boots: { name: this.bootsName.value, grade: 5 }
            }
        };
        
        try {
            // 백엔드 API 호출
            const response = await fetch('http://localhost:5000/api/calculate-power', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.updateResults(result.result);
            } else {
                console.error('전투력 계산 실패:', result.error);
            }
        } catch (error) {
            console.error('API 호출 실패:', error);
            // 오프라인 모드로 폴백
            this.calculatePowerOffline(data);
        }
    }

    calculateEquipmentBonuses() {
        const bonuses = { command: 0, force: 0, intelligence: 0, politics: 0, charm: 0 };
        
        // 장비 이름이 있으면 보너스 적용
        const equipmentNames = [
            this.weaponName.value.trim(),
            this.armorName.value.trim(),
            this.helmetName.value.trim(),
            this.shieldName.value.trim(),
            this.horseName.value.trim(),
            this.bootsName.value.trim()
        ];
        
        const equipmentCount = equipmentNames.filter(name => name.length > 0).length;
        
        // 장비 개수에 따른 보너스 (장비당 2씩)
        const equipmentBonus = equipmentCount * 2;
        
        // 각 스탯에 균등 분배
        Object.keys(bonuses).forEach(stat => {
            bonuses[stat] = equipmentBonus;
        });
        
        return bonuses;
    }

    calculateSkillBonuses() {
        const bonuses = { command: 0, force: 0, intelligence: 0, politics: 0, charm: 0 };
        
        // 스킬 이름이 있으면 보너스 적용
        const skillNames = [
            this.skill1.value.trim(),
            this.skill2.value.trim(),
            this.skill3.value.trim()
        ];
        
        const skillCount = skillNames.filter(name => name.length > 0).length;
        
        // 스킬 개수에 따른 보너스 (스킬당 3씩)
        const skillBonus = skillCount * 3;
        
        // 각 스탯에 균등 분배
        Object.keys(bonuses).forEach(stat => {
            bonuses[stat] = skillBonus;
        });
        
        return bonuses;
    }

    updateResults(result) {
        // 총 스탯 업데이트 (백엔드에서 계산된 결과 사용)
        this.totalCommand.textContent = result.breakdown.statsPower;
        this.totalForce.textContent = result.breakdown.statsPower;
        this.totalIntelligence.textContent = result.breakdown.statsPower;
        this.totalPolitics.textContent = result.breakdown.statsPower;
        this.totalCharm.textContent = result.breakdown.statsPower;
        
        // 전투력 업데이트
        this.totalPower.textContent = result.totalPower;
        
        // 등급 표시
        this.powerRank.textContent = result.rank;
        this.powerRank.className = `power-rank rank-${result.rankClass}`;
    }

    calculateRank(power) {
        if (power >= 800) {
            return { grade: 'S', text: 'S등급' };
        } else if (power >= 700) {
            return { grade: 'A', text: 'A등급' };
        } else if (power >= 600) {
            return { grade: 'B', text: 'B등급' };
        } else if (power >= 500) {
            return { grade: 'C', text: 'C등급' };
        } else {
            return { grade: 'D', text: 'D등급' };
        }
    }
}

// 페이지 로드 시 계산기 초기화
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new GeneralPowerCalculator();
    
    // 초기 계산 실행
    calculator.calculatePower();
    
    // 전역에서 접근 가능하도록 설정
    window.generalPowerCalculator = calculator;
});

// 입력 유효성 검사
function validateInput(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (value < min) input.value = min;
    if (value > max) input.value = max;
}

// 모든 숫자 입력에 유효성 검사 적용
document.addEventListener('DOMContentLoaded', () => {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
    });
});
