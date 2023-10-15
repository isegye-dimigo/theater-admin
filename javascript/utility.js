/**
 * @param {string[]} ids 
 * @returns {HTMLElement[]}
 */
function getElements(ids) {
	const elements = [];

	for(let i = 0; i < ids['length']; i++) {
		elements.push(document.getElementById(ids[i]));

		if(elements[i] === null) {
			throw new Error('ids[' + i + '] must be valid');
		}
	}

	return elements;
}

/**
 * @param  {HTMLElement[]} elements 
 * @returns {HTMLElement}
 */
function getTableData(elements) {
	const tableData = document.createElement('td');

	for(let i = 0; i < elements['length']; i++) {
		tableData.appendChild(elements[i]);
	}

	return tableData;
}

/**
 * 
 * @param {HTMLElement} target 
 * @param  {HTMLElement[]} elements 
 */
function appendChilds(target, elements) {
	for(let i = 0; i < elements['length']; i++) {
		target.appendChild(elements[i]);
	}
}

/**
 * @param {string} url
 * @param {string} text
 * @returns {HTMLElement}
 */
function getLink(url, text) {
	const link = window['document'].createElement('a');

	link['href'] = url;
	link['textContent'] = text;

	return link;
}