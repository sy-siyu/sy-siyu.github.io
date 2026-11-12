(() => {
  const form = document.querySelector('.publication-filters');
  if (!form) return;
  const type = document.querySelector('#publication-type');
  const year = document.querySelector('#publication-year');
  const papers = [...document.querySelectorAll('.archive-paper')];
  const groups = [...document.querySelectorAll('.archive-year')];
  const update = () => {
    let count = 0;
    papers.forEach(paper => {
      const visible = (type.value === 'all' || paper.dataset.type === type.value)
        && (year.value === 'all' || paper.dataset.pubYear === year.value);
      paper.hidden = !visible;
      if (visible) count++;
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.archive-paper')].some(paper => !paper.hidden); });
    document.querySelector('.publication-count').textContent = `${count} ${count === 1 ? 'paper' : 'papers'}`;
    document.querySelector('.publication-empty').hidden = count !== 0;
  };
  form.hidden = false;
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => { type.value = 'all'; year.value = 'all'; update(); });
  update();
})();
