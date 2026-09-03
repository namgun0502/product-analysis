// app.js - 웹 앱의 동적인 기능(동작)을 처리하는 파일입니다.
// 남건이 자바스크립트의 역할을 쉽게 파악할 수 있도록 상세한 한글 주석을 달았습니다.

// 1. HTML 문서 안에 있는 요소(HTML 태그)들을 자바스크립트로 가져옵니다.
// - counter: 클릭 횟수를 숫자로 표시할 <span> 태그
// - clickBtn: 사용자가 누르게 될 <button> 태그
const counterDisplay = document.getElementById('counter');
const clickBtn = document.getElementById('click-btn');

// 2. 숫자를 저장할 변수를 하나 만듭니다. 처음 시작은 0입니다.
let count = 0;

// 3. 버튼에 '클릭' 이벤트를 연결합니다.
// - 사용자가 버튼을 클릭하면, 화살표 안의 함수(동작)가 실행됩니다.
clickBtn.addEventListener('click', () => {
    // 숫자를 1씩 증가시킵니다.
    count = count + 1;

    // HTML 내의 숫자 텍스트를 새로운 숫자값(count)으로 변경하여 화면을 갱신합니다.
    counterDisplay.textContent = count;

    // 브라우저의 개발자 도구(F12) 콘솔 탭에도 기록을 남겨줍니다.
    console.log(`[로그] 버튼이 클릭되었습니다. 현재 횟수: ${count}번`);
    
    // 10번 누를 때마다 축하 효과를 콘솔에 띄웁니다.
    if (count % 10 === 0) {
        console.log(`🎉 축하합니다! ${count}회 돌파!`);
        
        // 버튼의 크기를 일시적으로 살짝 키웠다가 되돌려 강한 피드백을 줍니다.
        clickBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            clickBtn.style.transform = 'scale(1)';
        }, 150);
    }
});

// 4. 앱이 정상적으로 로드되었음을 콘솔에 출력합니다.
console.log('남건의 기본 웹 앱이 성공적으로 준비되었습니다! 브라우저 화면에서 버튼을 클릭해 보세요.');
