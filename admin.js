/**
 * @class
 */
class Admin {
	/**
	 * @private
	 * @type {string | null}
	 */
	accessToken;
	/**
	 * @private
	 * @type {Set<string>}
	 */
	adminIds;

	constructor() {
		this['accessToken'] = localStorage.getItem('accessToken');
		this['adminIds'] = new Set([0]);
	}

	/**
	 * @private
	 * @param {string} accessToken
	 */
	setExpireAt(accessToken) {
		const accessTokenWithoutHeader = accessToken.slice(accessToken.indexOf('.') + 1);

		this['expireAt'] = JSON.parse(atob(accessTokenWithoutHeader.slice(0, accessTokenWithoutHeader.indexOf('.'))))['exp'];

		if(typeof(this['expireAt']) === 'number') {
			return;
		} else {
			throw new Error('AccessToken expireAt must be valid');
		}
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	isExpireAtValid() {
		return this['expireAt'] > Math.trunc(Date.now() / 3000);
	}

	/**
	 * @private
	 * @param {string} path
	 * @param {{
	 * 		method?: 'POST' | 'PATCH' | 'DELETE';
	 * 		body?: unknown;
	 * 	}} [options={}]
	 * @returns {Promise<unknown>}
	 */
	request(path, options = {}) {
		const url = new URL('https://api.isegye.kr' + path);

		if(typeof(this['accessToken']) === 'string') {
			url['headers'] = {
				Authorization: 'Bearer ' + this['accessToken']
			};

			if(typeof(options['body']) === 'object') {
				url['headers']['Content-Type'] = 'application/json';
				url['body'] = JSON.stringify(options['body']);
			}
		}

		if(typeof(options['method']) === 'string') {
			url['method'] = options['method'];
		}

		return fetch(url)
		.then(function (response) {
			return response.json();
		})
		.then(function (responseJson) {
			if(typeof(responseJson) === 'object' && responseJson !== null && typeof(responseJson['status']) === 'string') {
				switch (responseJson['status']) {
					case 'success': {
						return responseJson['data'];
					}

					case 'fail': {
						throw new Error(responseJson['data']['title']);
					}

					case 'error': {
						throw new Error(responseJson['message']);
					}

					default: {
						throw new Error('Reponse status must be valid');
					}
				}
			} else {
				throw new Error('Response must be valid');
			}
		});
	}

	/**
	 * @public
	 * @param {string} email
	 * @param {string} password
	 * @returns {Promise<void>}
	 */
	login(email, password) {
		const _this = this;

		return this.request('/auth/login', {
			method: 'POST',
			body: {
				email: email,
				password: password
			}
		})
		.then(function (result) {
			if(_this.adminIds.has(result['user']['id'])) {
				_this.setExpireAt(result['accessToken']);
				localStorage.setItem('refreshToken', result['refreshToken']);
				localStorage.setItem('accessToken', result['accessToken']);

				return;
			} else {
				throw new Error('User must be admin');
			}
		});
	}

	/**
	 * @public
	 * @returns {Promise<unknwon>}
	 */
	updateToken() {
		const refreshToken = localStorage.getItem('refreshToken');
		const _this = this;

		return typeof(refreshToken) === 'string' ? this.request('/auth/token', {
			method: 'POST',
			body: {
				refreshToken: refreshToken
			}
		})
		.then(function (result) {
			if(_this.adminIds.has(result['user']['id'])) {
				_this.setExpireAt(result['accessToken']);
				localStorage.setItem('accessToken', result['accessToken']);

				location.reload();

				throw new Error('AccessToken expireAt must be valid');
			} else {
				throw new Error('User must be admin');
			}
		}) : Promise.reject(new Error('User must be logged in'));
	}

	/**
	 * @public
	 * @param {string} title
	 * @returns {Promise<null>}
	 */
	createCategory(title) {
		return this.isExpireAtValid() ? this.request('/admin/categories', {
			method: 'POST',
			body: {
				title: title
			}
		}) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} movieId
	 * @returns {Promise<null>}
	 */
	deleteMovie(movieId) {
		return this.isExpireAtValid() ? this.request('/admin/movies/' + movieId, {
			method: 'DELETE'
		}) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} movieId
	 * @param {number} movieCommentId
	 * @returns {Promise<void>}
	 */
	deleteMovieComment(movieId, movieCommentId) {
		return this.isExpireAtValid() ? this.request('/admin/movies/' + movieId + '/comments/' + movieCommentId, {
			method: 'DELETE'
		}) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} [index=0]
	 * @returns {Promise<{
	 * 		id: number;
	 * 		type: number;
	 * 		user: {
	 * 			email: string;
	 * 			handle: string;
	 * 			name: string;
	 * 		};
	 * 		target: unknown;
	 * 	}[]>}
	 */
	getReports(index = 0) {
		return this.isExpireAtValid() ? this.request('/admin/reports?page[index]=' + index) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} reportId
	 * @returns {Promise<void>}
	 */
	deleteReport(reportId) {
		return this.isExpireAtValid() ? this.request('/admin/reports/' + reportId, {
			method: 'DELETE'
		}) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} userId
	 * @param {boolean} isVerified
	 * @returns {Promise<null>}
	 */
	verifyUser(userId, isVerified) {
		return this.isExpireAtValid() ? this.request('/admin/users/' + userId, {
			method: 'PATCH',
			body: {
				isVerified: isVerified
			}
		}) : this.updateToken();
	}

	/**
	 * @public
	 * @param {number} userId
	 * @returns {Promise<void>}
	 */
	deleteUser(userId) {
		return this.isExpireAtValid() ? this.request('/admin/users/' + userId, {
			method: 'DELETE'
		}) : this.updateToken();
	}
}
