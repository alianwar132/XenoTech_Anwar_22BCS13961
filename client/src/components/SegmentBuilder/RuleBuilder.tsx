import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Plus } from "lucide-react";

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface SegmentRules {
  conditions: SegmentRule[];
  operator: 'AND' | 'OR';
}

interface RuleBuilderProps {
  rules: SegmentRules;
  onRulesChange: (rules: SegmentRules) => void;
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  onUpdateRule: (index: number, updates: Partial<SegmentRule>) => void;
  onApplyTemplate: (templateType: string) => void;
}

export default function RuleBuilder({
  rules,
  onRulesChange,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  onApplyTemplate
}: RuleBuilderProps) {
  const fieldOptions = [
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'lastPurchaseDate', label: 'Last Purchase Date (days ago)' },
    { value: 'visitCount', label: 'Visit Count' },
    { value: 'customerSince', label: 'Customer Since (days ago)' },
  ];

  const operatorOptions = [
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
  ];

  const templates = [
    {
      id: 'high-value',
      label: 'High-Value Customers',
      description: 'Total spend > ₹10,000'
    },
    {
      id: 'inactive',
      label: 'Inactive Users', 
      description: 'Last purchase > 90 days ago'
    },
    {
      id: 'frequent',
      label: 'Frequent Buyers',
      description: 'Visit count > 10 AND Total spend > ₹5,000'
    }
  ];

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Segment Rules</h4>
      
      {/* Rule Builder Area */}
      <div className="space-y-4 mb-6">
        <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          {rules.conditions.length === 0 ? (
            <div className="text-center text-gray-500 mb-4">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p>Click "Add Rule" below to start building your segment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.conditions.map((rule, index) => (
                <div key={index}>
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <Select
                          value={rule.field}
                          onValueChange={(value) => onUpdateRule(index, { field: value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={rule.operator}
                          onValueChange={(value) => onUpdateRule(index, { operator: value })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            {operatorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={rule.value}
                          onChange={(e) => onUpdateRule(index, { value: e.target.value })}
                          placeholder="Value"
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveRule(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* AND/OR Logic Connector */}
                  {index < rules.conditions.length - 1 && (
                    <div className="flex items-center justify-center my-3">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <Button
                          variant={rules.operator === 'AND' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onRulesChange({ ...rules, operator: 'AND' })}
                          className="mr-2"
                        >
                          AND
                        </Button>
                        <Button
                          variant={rules.operator === 'OR' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onRulesChange({ ...rules, operator: 'OR' })}
                        >
                          OR
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button
          onClick={onAddRule}
          variant="outline"
          className="w-full border-2 border-dashed border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Rule
        </Button>
      </div>

      {/* Quick Templates */}
      <div>
        <h5 className="font-medium text-gray-800 mb-3">Quick Templates</h5>
        <div className="space-y-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => onApplyTemplate(template.id)}
              className="w-full text-left justify-start p-3 h-auto"
            >
              <div>
                <div className="font-medium">{template.label}:</div>
                <div className="text-sm text-gray-500">{template.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
