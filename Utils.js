class Utils {
    /**
    * Flitered other data type of data for plots.
    * @param {any} newData The newData parameter take the data for creation of Scatter plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterOtherTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                let countVal = 0;
                for (let j = i + 1; j < newData.length; j++) {
                    if (newData[i][keyForPlotCreation] == newData[j][keyForPlotCreation]) {
                        let isAlreadyAdded = false;
                        for (let k = 0; k < dataArr.length; k++) {
                            if (dataArr[k].name == newData[i][keyForPlotCreation]) {
                                isAlreadyAdded = true;
                                break;
                            }
                        }
                        if (!isAlreadyAdded) {
                            if (idKeyValue != undefined) {
                                idsArr.push(newData[j][idKeyValue])
                            }
                            else {
                                idsArr.push(newData[j][idForPlotCreation]);
                            }
                            countVal++;
                        }
                    }
                }
                if (countVal == 0) {
                    let isAlreadyAdded = false;
                    for (let k = 0; k < dataArr.length; k++) {
                        if (dataArr[k].name == newData[i][keyForPlotCreation]) {
                            isAlreadyAdded = true;
                            break;
                        }
                    }
                    if (!isAlreadyAdded) {
                        if (idKeyValue != undefined) {
                            idsArr.push(newData[i][idKeyValue])
                        }
                        else {
                            idsArr.push(newData[i][idForPlotCreation])
                        }
                        countVal++;
                        let data = {
                            name: newData[i][keyForPlotCreation],
                            ids: idsArr,
                            value: countVal
                        };
                        dataArr.push(data);
                    }
                }
                else if (countVal > 0) {
                    if (idKeyValue != undefined) {
                        idsArr.push(newData[i][idKeyValue])
                    }
                    else {
                        idsArr.push(newData[i][idForPlotCreation])
                    }
                    countVal++;
                    let data = {
                        name: newData[i][keyForPlotCreation],
                        ids: idsArr,
                        value: countVal
                    };
                    dataArr.push(data);
                }
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    *Flitered number data type data for plots.
    * @param {any} newData The newData parameter take the data for creation of Scatter plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterNumberTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                if (idKeyValue != undefined) {
                    idsArr.push(newData[i][idKeyValue])
                }
                else {
                    idsArr.push(newData[i][idForPlotCreation])
                }
                let val = newData[i][keyForPlotCreation];
                let data = {
                    name: newData[i][keyForPlotCreation],
                    ids: idsArr,
                    value: val
                };
                dataArr.push(data);
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    * Flitered number data type data for Line and Scatter plots.
    * @param {any} newData The newData parameter take the data for creation of Scatter plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} valueForPlotCreation The valueForPlotCreation parameter is the value for the creation of the Line and Scatter plots.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of the Line and Scatter plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterLineAndScatterData(newData, idForPlotCreation, valueForPlotCreation, keyForPlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {

                let found = false;
                for (let j = 0; j < dataArr.length; j++) {
                    if (dataArr[j].key === newData[i][keyForPlotCreation] &&
                        dataArr[j].value === newData[i][valueForPlotCreation]) {
                        found = true;
                        if (idKeyValue != undefined) {
                            dataArr[j].ids.push(newData[i][idKeyValue])
                        }
                        else {
                            dataArr[j].ids.push(newData[i][idForPlotCreation])
                        }
                        break;
                    }
                }

                if (!found) {
                    let idsArr = [];
                    if (idKeyValue != undefined) {
                        idsArr.push(newData[i][idKeyValue])
                    }
                    else {
                        idsArr.push(newData[i][idForPlotCreation])
                    }
                    let val = newData[i][valueForPlotCreation];
                    let data = {
                        key: newData[i][keyForPlotCreation],
                        ids: idsArr,
                        value: val
                    };
                    dataArr.push(data);
                }
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    * Flitered number data type data for ParallelCoordinate plot.
    * @param {any} newData The newData parameter take the data for creation of ParallelCoordinate plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterParallelCoordinateData(newData, idForPlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                if (idKeyValue != undefined) {
                    idsArr.push(newData[i][idKeyValue])
                }
                else {
                    idsArr.push(newData[i][idForPlotCreation])
                }
                let data = newData[i];
                dataArr.push(data);
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    * Flitered other data type of data for ParallelCoordinate plot.
    * @param {any} newData The newData parameter take the data for creation of ParallelCoordinate plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterOtherTypeParallelCoordinateData(newData, idForPlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                let countVal = 0;
                for (let j = i + 1; j < newData.length; j++) {
                    if (newData[i] == newData[j]) {
                        let isAlreadyAdded = false;
                        for (let k = 0; k < dataArr.length; k++) {
                            if (dataArr[k].name == newData[i]) {
                                isAlreadyAdded = true;
                                break;
                            }
                        }
                        if (!isAlreadyAdded) {
                            if (idKeyValue != undefined) {
                                idsArr.push(newData[j][idKeyValue])
                            }
                            else {
                                idsArr.push(newData[j][idForPlotCreation]);
                            }
                            countVal++;
                        }
                    }
                }
                if (countVal == 0) {
                    let isAlreadyAdded = false;
                    for (let k = 0; k < dataArr.length; k++) {
                        if (dataArr[k].name == newData[i]) {
                            isAlreadyAdded = true;
                            break;
                        }
                    }
                    if (!isAlreadyAdded) {
                        if (idKeyValue != undefined) {
                            idsArr.push(newData[i][idKeyValue])
                        }
                        else {
                            idsArr.push(newData[i][idForPlotCreation])
                        }
                        countVal++;
                        let data = newData[i];
                        dataArr.push(data);
                    }
                }
                else if (countVal > 0) {
                    if (idKeyValue != undefined) {
                        idsArr.push(newData[i][idKeyValue])
                    }
                    else {
                        idsArr.push(newData[i][idForPlotCreation])
                    }
                    countVal++;
                    let data = newData[i];
                    dataArr.push(data);
                }
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    * Flitered number data type data for Bubble plot.
    * @param {any} newData The newData parameter take the data for creation of Bubble plot.
    * @param {number} idForBubblePlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} valueForBubblePlotCreation The valueForBubblePlotCreation parameter is the value for the creation of the Bubble plot.
    * @param {string} keyForBubblePlotCreation The keyForPlotCreation parameter is the key for the creation of the Bubble plot.
    * @param {string} radiusForBubblePlotCreation The radiusForBubblePlotCreation parameter is the radius for the creation of the Bubble plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterBubblePlotData(newData, idForBubblePlotCreation, valueForBubblePlotCreation, keyForBubblePlotCreation, radiusForBubblePlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                if (idKeyValue != undefined) {
                    idsArr.push(newData[i][idKeyValue])
                }
                else {
                    idsArr.push(newData[i][idForBubblePlotCreation])
                }
                let val = newData[i][valueForBubblePlotCreation];
                let data = {
                    key: newData[i][keyForBubblePlotCreation],
                    radius: newData[i][radiusForBubblePlotCreation],
                    ids: idsArr,
                    value: val
                };
                dataArr.push(data);
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }

    /**
    * Flitered other data type data for Bubble plot.
    * @param {any} newData The newData parameter take the data for creation of Bubble plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of the Bubble plot.
    * @param {string} radiusForBubblePlotCreation The radiusForBubblePlotCreation parameter is the radius for the creation of the Bubble plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    filterBubbleOtherTypeData(newData, idForPlotCreation, keyForPlotCreation, radiusForBubblePlotCreation, idKeyValue) {
        try {
            let dataArr = [];
            for (let i = 0; i < newData.length; i++) {
                let idsArr = [];
                let countVal = 0;
                for (let j = i + 1; j < newData.length; j++) {
                    if (newData[i][keyForPlotCreation] == newData[j][keyForPlotCreation]) {
                        let isAlreadyAdded = false;
                        for (let k = 0; k < dataArr.length; k++) {
                            if (dataArr[k].name == newData[i][keyForPlotCreation]) {
                                isAlreadyAdded = true;
                                break;
                            }
                        }
                        if (!isAlreadyAdded) {
                            if (idKeyValue != undefined) {
                                idsArr.push(newData[j][idKeyValue])
                            }
                            else {
                                idsArr.push(newData[j][idForPlotCreation]);
                            }
                            countVal++;
                        }
                    }
                }
                if (countVal == 0) {
                    let isAlreadyAdded = false;
                    for (let k = 0; k < dataArr.length; k++) {
                        if (dataArr[k].name == newData[i][keyForPlotCreation]) {
                            isAlreadyAdded = true;
                            break;
                        }
                    }
                    if (!isAlreadyAdded) {
                        if (idKeyValue != undefined) {
                            idsArr.push(newData[i][idKeyValue])
                        }
                        else {
                            idsArr.push(newData[i][idForPlotCreation])
                        }
                        countVal++;
                        let data = {
                            name: newData[i][keyForPlotCreation],
                            radius: newData[i][radiusForBubblePlotCreation],
                            ids: idsArr,
                            value: countVal
                        };
                        dataArr.push(data);
                    }
                }
                else if (countVal > 0) {
                    if (idKeyValue != undefined) {
                        idsArr.push(newData[i][idKeyValue])
                    }
                    else {
                        idsArr.push(newData[i][idForPlotCreation])
                    }
                    countVal++;
                    let data = {
                        name: newData[i][keyForPlotCreation],
                        radius: newData[i][radiusForBubblePlotCreation],
                        ids: idsArr,
                        value: countVal
                    };
                    dataArr.push(data);
                }
            }
            let returnValue = {
                "status": "success",
                "message": "Plot added.",
                "data": dataArr
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Plot not added." + err.message,
                "data": dataArr
            }
            return returnValue;
        }
    }
}

const utilsInstance = new Utils();

Object.freeze(utilsInstance);

export default utilsInstance;