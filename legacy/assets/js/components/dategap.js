function calculate() {
  const fromDate = document.getElementById('from').value;
  const toDate = document.getElementById('to').value;
  const result = document.getElementById('result');

  // Reset previous result message
  result.innerHTML = '';

  if (!fromDate || !toDate) {
    result.innerHTML = '<span style="color: red;">Please select both dates.</span>';
    return;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // Calculate the difference in time
  const timeDifference = to - from;
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  // Display the difference, allowing negative values
  result.innerHTML = `<span style="color: green;">The gap between the dates is ${Math.ceil(daysDifference)} days.</span>`;
}

/*==================== RESET FORM ====================*/
function resetCalc() {
  document.getElementById('from').value = '';
  document.getElementById('to').value = '';
  document.getElementById('result').innerHTML = ''; // Clear the result message
}
