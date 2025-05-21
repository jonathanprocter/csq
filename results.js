// Display questionnaire results stored in sessionStorage

document.addEventListener('DOMContentLoaded', () => {
  const scores = JSON.parse(sessionStorage.getItem('schemaScores') || '[]');
  const container = document.getElementById('results-overview');

  if (!scores.length) {
    container.innerHTML = '<p class="error-message content-box">No results found. Please complete the questionnaire first.</p>';
    return;
  }

  scores.forEach(score => {
    const result = document.createElement('div');
    result.className = 'schema-result';
    result.innerHTML = `
      <div class="schema-score">
        <span class="score-label">${score.name}</span>
        <div class="score-bar-container">
          <div class="score-bar" style="width: ${score.percentage.toFixed(0)}%"></div>
        </div>
        <span class="score-value">${score.score}/${score.maxPossibleScore}</span>
      </div>
      <div class="schema-interpretation">${score.description}</div>
    `;
    container.appendChild(result);
  });
});
