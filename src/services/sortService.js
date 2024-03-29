const toObjectForSort = (sortConditions) => {
    const sortCriterias = [];

    for (const condition of sortConditions) {
      const sortCriteria = {
        [condition.columnName]: condition.sortOrder 
      };

      sortCriterias.push(sortCriteria);
    } 
  
    const sortObject = Object.assign({}, ...sortCriterias);

    return sortObject;
}

export {toObjectForSort}