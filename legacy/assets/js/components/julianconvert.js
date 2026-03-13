function convertToJulian() {
    const gregorianDate = new Date(document.getElementById('gregorianDate').value);
    const month = (gregorianDate.getMonth() + 1).toString().padStart(2, '0');
    const day = gregorianDate.getDate().toString().padStart(2, '0');
    const year = gregorianDate.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    const daysDifference = Math.floor((gregorianDate - januaryFirst) / (24 * 60 * 60 * 1000)) + 1;
    const julianDate = parseInt(year.toString().slice(2) + daysDifference.toString().padStart(3, '0'));
    document.getElementById('result-julian').innerText = `Julian Date: ${julianDate}`;
}
function convertToGregorian() {
    const julianDate = parseInt(document.getElementById('julianDate').value);
    const year = 2000 + Math.floor(julianDate / 1000);
    const days = julianDate % 1000;
    const gregorianDate = new Date(year, 0, 1);
    gregorianDate.setDate(gregorianDate.getDate() + days - 1);
    const result = `${(gregorianDate.getMonth() + 1).toString().padStart(2, '0')}/${gregorianDate.getDate().toString().padStart(2, '0')}/${gregorianDate.getFullYear()}`;
    document.getElementById('result-julian').innerText = `Gregorian Date: ${result}`;
}
function clearFields() {
    document.getElementById('gregorianDate').value = '';
    document.getElementById('julianDate').value = '';
    document.getElementById('result').innerText = '';
}