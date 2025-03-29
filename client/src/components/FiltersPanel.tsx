import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { YEARS, SUBJECTS, DIFFICULTIES } from "@/lib/constants";

export interface Filters {
  difficulty: string;
  subject: string;
  year: string;
}

interface FiltersPanelProps {
  onApplyFilters: (filters: Filters) => void;
}

const FiltersPanel = ({ onApplyFilters }: FiltersPanelProps) => {
  const [filters, setFilters] = useState<Filters>({
    difficulty: "all",
    subject: "all",
    year: "all"
  });
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium text-neutral-dark mb-4">Filter Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="block text-sm font-medium text-neutral-medium mb-2">Difficulty</Label>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => handleFilterChange("difficulty", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTIES.map(difficulty => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-medium mb-2">Subject</Label>
            <Select
              value={filters.subject}
              onValueChange={(value) => handleFilterChange("subject", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-medium mb-2">Year</Label>
            <Select
              value={filters.year}
              onValueChange={(value) => handleFilterChange("year", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleApplyFilters}>
            <Filter className="mr-1 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;
