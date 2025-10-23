// 더미 입력 페이지 JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // 총 스탯 실시간 계산 함수
    function updateTotalStats() {
        console.log('updateTotalStats 함수 실행');
        
        const baseCommand = parseInt(document.getElementById('command').value) || 0;
        const baseForce = parseInt(document.getElementById('force').value) || 0;
        const baseIntelligence = parseInt(document.getElementById('intelligence').value) || 0;
        const basePolitics = parseInt(document.getElementById('politics').value) || 0;
        const baseCharm = parseInt(document.getElementById('charm').value) || 0;
        
        console.log('기본 스탯:', baseCommand, baseForce, baseIntelligence, basePolitics, baseCharm);
        
        const levelupCommand = parseInt(document.getElementById('levelupCommand').value) || 0;
        const levelupForce = parseInt(document.getElementById('levelupForce').value) || 0;
        const levelupIntelligence = parseInt(document.getElementById('levelupIntelligence').value) || 0;
        const levelupPolitics = parseInt(document.getElementById('levelupPolitics').value) || 0;
        const levelupCharm = parseInt(document.getElementById('levelupCharm').value) || 0;
        
        const addCommand = parseInt(document.getElementById('addCommand').value) || 0;
        const addForce = parseInt(document.getElementById('addForce').value) || 0;
        const addIntelligence = parseInt(document.getElementById('addIntelligence').value) || 0;
        const addPolitics = parseInt(document.getElementById('addPolitics').value) || 0;
        const addCharm = parseInt(document.getElementById('addCharm').value) || 0;
        
        // 총 스탯 계산
        const totalCommand = baseCommand + levelupCommand + addCommand;
        const totalForce = baseForce + levelupForce + addForce;
        const totalIntelligence = baseIntelligence + levelupIntelligence + addIntelligence;
        const totalPolitics = basePolitics + levelupPolitics + addPolitics;
        const totalCharm = baseCharm + levelupCharm + addCharm;
        
        // 총 스탯 표시 업데이트
        console.log('총 스탯:', totalCommand, totalForce, totalIntelligence, totalPolitics, totalCharm);
        
        const summaryCommand = document.getElementById('summaryCommand');
        const summaryForce = document.getElementById('summaryForce');
        const summaryIntelligence = document.getElementById('summaryIntelligence');
        const summaryPolitics = document.getElementById('summaryPolitics');
        const summaryCharm = document.getElementById('summaryCharm');
        
        if (summaryCommand) summaryCommand.textContent = totalCommand;
        if (summaryForce) summaryForce.textContent = totalForce;
        if (summaryIntelligence) summaryIntelligence.textContent = totalIntelligence;
        if (summaryPolitics) summaryPolitics.textContent = totalPolitics;
        if (summaryCharm) summaryCharm.textContent = totalCharm;
    }
    
    // 모든 스탯 입력 필드에 이벤트 리스너 추가
    const statInputs = [
        'command', 'force', 'intelligence', 'politics', 'charm',
        'levelupCommand', 'levelupForce', 'levelupIntelligence', 'levelupPolitics', 'levelupCharm',
        'addCommand', 'addForce', 'addIntelligence', 'addPolitics', 'addCharm'
    ];
    
    statInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateTotalStats);
        }
    });
    
    // 초기 계산 (페이지 로드 후 약간 지연)
    setTimeout(updateTotalStats, 100);
    // 저장 버튼 이벤트 (더미 데이터용)
    document.getElementById('saveGeneral').addEventListener('click', async () => {
        const generalName = document.getElementById('generalName').value;
        const generalYear = parseInt(document.getElementById('generalYear').value);
        const generalGrade = parseInt(document.getElementById('generalGrade').value);
        const level = parseInt(document.getElementById('level').value);
        const actualPower = parseInt(document.getElementById('power').value);
        
        if (!generalName.trim()) {
            alert('무장 이름을 입력해주세요.');
            return;
        }
        
        if (!actualPower || actualPower <= 0) {
            alert('실제 전투력을 입력해주세요.');
            return;
        }
        
        // 기본 스탯 수집
        const baseStats = {
            command: parseInt(document.getElementById('baseCommand').value) || 0,
            force: parseInt(document.getElementById('baseForce').value) || 0,
            intelligence: parseInt(document.getElementById('baseIntelligence').value) || 0,
            politics: parseInt(document.getElementById('basePolitics').value) || 0,
            charm: parseInt(document.getElementById('baseCharm').value) || 0
        };
        
        // 레벨업 스탯 수집
        const levelupStats = {
            command: parseInt(document.getElementById('levelupCommand').value) || 0,
            force: parseInt(document.getElementById('levelupForce').value) || 0,
            intelligence: parseInt(document.getElementById('levelupIntelligence').value) || 0,
            politics: parseInt(document.getElementById('levelupPolitics').value) || 0,
            charm: parseInt(document.getElementById('levelupCharm').value) || 0
        };
        
        // 스킬 수집
        const skills = {
            skill1: document.getElementById('skill1').value,
            skill2: document.getElementById('skill2').value,
            skill3: document.getElementById('skill3').value,
            skill4: document.getElementById('skill4').value
        };
        
        // 장비 수집
        const equipment = {
            weapon: {
                name: document.getElementById('weaponName').value,
                grade: parseInt(document.getElementById('weaponGrade').value) || 0
            },
            armor: {
                name: document.getElementById('armorName').value,
                grade: parseInt(document.getElementById('armorGrade').value) || 0
            },
            accessory: {
                name: document.getElementById('accessoryName').value,
                grade: parseInt(document.getElementById('accessoryGrade').value) || 0
            },
            mount: {
                name: document.getElementById('mountName').value,
                grade: parseInt(document.getElementById('mountGrade').value) || 0
            },
            shield: {
                name: document.getElementById('shieldName').value,
                grade: parseInt(document.getElementById('shieldGrade').value) || 0
            }
        };
        
        try {
            // 백엔드로 학습 데이터 전송
            const response = await fetch('http://localhost:5000/api/calculate-power', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    generalName,
                    generalYear,
                    generalGrade,
                    level,
                    baseStats,
                    skills,
                    equipment,
                    actualPower
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`학습 데이터가 저장되었습니다!\n추정 전투력: ${result.result.estimatedPower}\n실제 전투력: ${actualPower}`);
                
                // 패턴 정보 표시
                console.log('학습된 패턴:', result.result.patterns);
            } else {
                alert('학습 데이터 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('학습 데이터 전송 오류:', error);
            alert('학습 데이터 전송에 실패했습니다.');
        }
    });
});