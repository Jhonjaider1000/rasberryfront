import { get as getProp } from 'object-path';

class ParamsBuilder {
    uri = '';
    params = [];

    replaceVars(appState, url) {
        const variables = url.match(new RegExp(/\:([\w]+)/g));
        if (!variables) {
            return url;
        }
        variables.forEach(variable => {
            const variableName = variable.replace(/\:/g, '');
            const variableValue = appState[variableName];
            url = url.replace(new RegExp(variable), variableValue);
        });
        return url;
    }

    addVarsFromState(appState, data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (typeof value == 'string') {
                    const result = value.match(new RegExp(/\:([\w]+)/g));
                    if (result) {
                        const variableName = value.replace(/\:/g, '');
                        data[key] = getProp(appState, variableName, null);
                    }
                }
            }
        }
        return data;
    }

    url(url) {
        this.uri = url;
        return this;
    }

    add(key, value) {
        this.params.push({ key: key, value: value });
        return this;
    }

    parse(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                this.add(key, element);
            }
        }
        return this;
    }

    toString() {
        const url = this.uri;
        return ((url.search('[?]') >= 0) ? url : url) + '?' + this.params.map((param => {
            return `${param.key}=${param.value}`;
        })).join('&');
    }
};

export default new ParamsBuilder();
