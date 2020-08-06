class Swallow {
    #loadingRequests = [];//{id:1,xhr:some XmlHttpRequest}
    #withCredentials;
    #commonBodyParams;
    #headers;
    #baseUrl;
    #responseDataType;
    #commonSearchParams;
    #usedIds = new Set();

    constructor(initialOptions = {}) {
        const {
            commonBodyParams = {},
            headers = null,
            withCredentials = false,
            baseUrl = '',
            responseDataType = 'text',
            commonSearchParams = []
        } = initialOptions;

        this.#withCredentials = withCredentials;//boolean
        this.#commonBodyParams = commonBodyParams;//object
        this.#commonSearchParams = commonSearchParams;//array of objects
        this.#headers = headers;//array of objects
        this.#baseUrl = baseUrl;
        this.#responseDataType = responseDataType;
    }

    #getId = () => {
        const rand = (Math.random() * 100).toFixed(2);
        if(!this.#usedIds.has(rand)){
            this.#usedIds.add(rand);
            return rand;
        }
        return this.#getId();
    };
    toJSON = (data)=>{
        try{
            return JSON.parse(data)
        }catch (e) {
            return data;
        }
    };
    #URLConstructor = (additionalURL, params = {}) => {
        let url;
        if (!!this.#baseUrl) {
            url = new URL(additionalURL, this.#baseUrl);
        } else {
            url = new URL(additionalURL);
        }
        this.#setSearchParams(url, {...this.#commonSearchParams, ...params});
        return url;
    };
    #setSearchParams = (url, additionalParams = {}) => {
        let params = additionalParams;

        if (!!this.#commonSearchParams) {
            params = {...this.#commonSearchParams, ...params}
        }

        for (const [name, value] of Object.entries(params)) {
            url.searchParams.set(name, value.toString());
        }
    };
    #createBodyParams = (additionalParams = {}) => {
        return JSON.stringify({...this.#commonBodyParams, ...additionalParams})
    };
    #setHeaders = (xhr, headers = {}) => {
        if (!!headers) {
            for (const [header, value] of Object.entries(headers)) {
                xhr.setRequestHeader(header.toString(), value.toString())
            }
        }
    };
    #createXHR = ({method, additionalURL, searchParams, responseDataType, withCredentials, headers, abortId}) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, this.#URLConstructor(additionalURL, searchParams), true);
        /*set request options*/
        xhr.responseType = responseDataType || this.#responseDataType;
        xhr.withCredentials = (typeof withCredentials === 'boolean') ? withCredentials : this.#withCredentials;
        this.#setHeaders(xhr, {...this.#headers, ...headers});

        const send = xhr.send.bind(xhr);
        return [
            send,
            (resolve, reject) => {
                /*set listeners*/
                this.#setMethods(xhr, resolve, reject, abortId);
                /*reg xhr in array for aborting*/
                this.#loadingRequests.push({id: abortId, xhr});
            }
        ]
    };
    #initializeRequest = (method, additionalURL, options) => {
        const abortId = this.#getId();
        const {searchParams, ...additionalOptions} = options;
        const {headers = {}, withCredentials = null, responseDataType = null} = additionalOptions;
        let [send, promiseFunc] = this.#createXHR({
            method, additionalURL,
            searchParams, responseDataType,
            withCredentials, headers, abortId
        });
        return {
            userData: [
                new Promise(promiseFunc),
                abortId
            ],
            send
        }
    };
    #setMethods = (xhr, resolve, reject, abortId) => {
        const successReq = ({currentTarget}) => {
            let {response, status} = currentTarget;

            response = this.toJSON(response);

            if (status >= 400) {
                reject({status, response});
            }else{
                resolve({response, status});
            }

            this.#usedIds.delete(abortId);
        };
        xhr.onload = successReq;
        xhr.onerror = successReq
        xhr.onabort = () => {
            resolve(this.abort(abortId));
            this.#usedIds.delete(abortId);
        };
        xhr.onloadend =successReq;
    };

    abort(id) {
        const toAbortIndex = this.#loadingRequests.findIndex((e) => e.id === id);
        if (toAbortIndex !== -1) {
            this.#loadingRequests[toAbortIndex].xhr.abort();
            this.#loadingRequests = [
                ...this.#loadingRequests.slice(0, toAbortIndex),
                ...this.#loadingRequests.slice(toAbortIndex + 1)
            ];
            return true;
        }
        return false;
    }

    get(url, data = {}, options = {}) {
        const {send, userData} = this.#initializeRequest('get', url, {...options, searchParams: data});
        send();
        return userData;
    }

    post(url, data = {}, options = {}) {
        const {send, userData} = this.#initializeRequest('post', url, options);
        send(this.#createBodyParams(data));
        return userData;
    }

    put(url, data = {}, options = {}) {
        const {send, userData} = this.#initializeRequest('post', url, options);
        send(this.#createBodyParams(data));
        return userData;
    }

    update(url, data = {}, options = {}) {
        const {send, userData} = this.#initializeRequest('post', url, options);
        send(this.#createBodyParams(data));
        return userData;
    }

    delete(url, data = {}, options = {}) {
        const {send, userData} = this.#initializeRequest('post', url, options);
        send(this.#createBodyParams(data));
        return userData;
    }

    addCustomMethod(method) {
        this[method] = (url, data = {}, options = {}) => {
            const {send, userData} = this.#initializeRequest(method, url, options);
            send(this.#createBodyParams(data));
            return userData;
        }
    }
}

module.exports = Swallow;