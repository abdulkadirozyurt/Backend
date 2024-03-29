import mongoose from "mongoose";

export const buildFilters = (filteringConditions,searchText,columnNameForSearch) => {
  const filters =[]

  if(filteringConditions){
    const filter = selectedFiltersQuery(filteringConditions)
    filters.push(filter)
  }

  const searchFilter = searchFilterQuery(searchText,columnNameForSearch)
  filters.push(searchFilter);

  const combinedFilter = filters.length > 1 ? { $and: filters } : filters[0];

  return combinedFilter
  };
  
  export const selectedFiltersQuery = (filteringConditions) => {
    const filters = [];
  
    filteringConditions.forEach((filteringCondition) => {
      const { columnName, filterFields } = filteringCondition;
      const filter = { [columnName]: { $in: filterFields } };
      filters.push(filter);
    });
  
    return filters.length > 1 ? { $and: filters } : filters[0]; 
  };

  export const searchFilterQuery = (searchText, columnName)=>{
    const searchFilter = {
      [columnName]: { $regex: new RegExp(searchText, "i") }
    };

    return searchFilter;
  }

  export async function findDistinctFieldValues(collectionName, columns) {
    try {
      let columnsDistinctValues=[]
      const collection = mongoose.connection.collection(collectionName);
        
      for (const column of columns) {
        const distinctValues = await collection.distinct(column, {}, { collation: { locale: 'tr', strength: 2 } });
        
        const columnsDistinctValue={
          columName:column,
          distinctValues:distinctValues
        }
        columnsDistinctValues.push(columnsDistinctValue)

      }
      return columnsDistinctValues;

    } catch (error) {
        console.error('Hata:', error);
        return [];
    }
  }

