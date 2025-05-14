import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface FiltersState {
  categories: string[];
  priceRanges: string[];
  brands: string[];
}

interface ProductFiltersProps {
  onFilterChange: (filters: FiltersState) => void;
}

const ProductFilters = ({ onFilterChange }: ProductFiltersProps) => {
  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    priceRanges: [],
    brands: [],
  });
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRanges: true,
    brands: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleFilterChange = (type: keyof FiltersState, value: string) => {
    const updatedFilters = { ...filters };
    
    if (updatedFilters[type].includes(value)) {
      // Remove from filter if already selected
      updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
    } else {
      // Add to filter
      updatedFilters[type] = [...updatedFilters[type], value];
    }
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      categories: [],
      priceRanges: [],
      brands: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="w-full md:w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-28">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-montserrat font-semibold text-lg">Filtros</h3>
        <button 
          onClick={clearFilters}
          className="text-sm text-accent hover:underline"
        >
          Limpar
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h4 className="font-medium">Categoria</h4>
          {expandedSections.categories ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        
        {expandedSections.categories && (
          <div className="space-y-2">
            <FilterCheckbox 
              id="category-face"
              label="Rosto"
              checked={filters.categories.includes('face')}
              onChange={() => handleFilterChange('categories', 'face')}
            />
            <FilterCheckbox 
              id="category-eyes"
              label="Olhos"
              checked={filters.categories.includes('eyes')}
              onChange={() => handleFilterChange('categories', 'eyes')}
            />
            <FilterCheckbox 
              id="category-lips"
              label="Lábios"
              checked={filters.categories.includes('lips')}
              onChange={() => handleFilterChange('categories', 'lips')}
            />
            <FilterCheckbox 
              id="category-accessories"
              label="Acessórios"
              checked={filters.categories.includes('accessories')}
              onChange={() => handleFilterChange('categories', 'accessories')}
            />
          </div>
        )}
      </div>
      
      {/* Price Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('priceRanges')}
        >
          <h4 className="font-medium">Preço</h4>
          {expandedSections.priceRanges ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        
        {expandedSections.priceRanges && (
          <div className="space-y-2">
            <FilterCheckbox 
              id="price-under-50"
              label="Até R$50"
              checked={filters.priceRanges.includes('under-50')}
              onChange={() => handleFilterChange('priceRanges', 'under-50')}
            />
            <FilterCheckbox 
              id="price-50-100"
              label="R$50 - R$100"
              checked={filters.priceRanges.includes('50-100')}
              onChange={() => handleFilterChange('priceRanges', '50-100')}
            />
            <FilterCheckbox 
              id="price-100-200"
              label="R$100 - R$200"
              checked={filters.priceRanges.includes('100-200')}
              onChange={() => handleFilterChange('priceRanges', '100-200')}
            />
            <FilterCheckbox 
              id="price-over-200"
              label="Acima de R$200"
              checked={filters.priceRanges.includes('over-200')}
              onChange={() => handleFilterChange('priceRanges', 'over-200')}
            />
          </div>
        )}
      </div>
      
      {/* Brand Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('brands')}
        >
          <h4 className="font-medium">Marca</h4>
          {expandedSections.brands ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        
        {expandedSections.brands && (
          <div className="space-y-2">
            <FilterCheckbox 
              id="brand-cynthia"
              label="Cynthia Beauty"
              checked={filters.brands.includes('Cynthia Beauty')}
              onChange={() => handleFilterChange('brands', 'Cynthia Beauty')}
            />
            <FilterCheckbox 
              id="brand-mac"
              label="MAC"
              checked={filters.brands.includes('MAC')}
              onChange={() => handleFilterChange('brands', 'MAC')}
            />
            <FilterCheckbox 
              id="brand-maybelline"
              label="Maybelline"
              checked={filters.brands.includes('Maybelline')}
              onChange={() => handleFilterChange('brands', 'Maybelline')}
            />
            <FilterCheckbox 
              id="brand-rubyrose"
              label="Ruby Rose"
              checked={filters.brands.includes('Ruby Rose')}
              onChange={() => handleFilterChange('brands', 'Ruby Rose')}
            />
          </div>
        )}
      </div>
      
      <button 
        onClick={() => onFilterChange(filters)}
        className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-opacity-90 transition"
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const FilterCheckbox = ({ id, label, checked, onChange }: FilterCheckboxProps) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer group">
      <div className={`h-4 w-4 border rounded flex items-center justify-center mr-2 ${checked ? 'bg-accent border-accent' : 'border-gray-300 group-hover:border-accent'}`}>
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <input 
        type="checkbox" 
        id={id} 
        className="hidden" 
        checked={checked}
        onChange={onChange}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
};

export default ProductFilters;
