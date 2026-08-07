import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Switch } from '../../../shared/components/ui/switch';
import { RadioGroup } from '../../../shared/components/ui/radio';

export default function InboxPage() {
  const dateSelectItems = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Today',
      value: 'today',
    },
    {
      label: 'This week',
      value: 'this_week',
    },
    {
      label: 'This month',
      value: 'this_month',
    },
    {
      label: 'This year',
      value: 'this_year',
    },
  ];

  return (
    <div className="p-8 h-full bg-white">
      <div className="flex items-center justify-between gap-5 mb-5">
        <div>80 notes</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span>Date</span>
            <Select value={'all'} onValueChange={(value) => {}}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateSelectItems.map((selectItem, index) => {
                  return (
                    <SelectItem key={index} value={selectItem.value}>
                      {selectItem.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span>Completed notes</span>
            <Switch checked={true} onCheckedChange={(value) => {}} />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="p-4 border rounded-lg flex items-start bg-white">
          <div className="flex-grow" contentEditable>
            test
          </div>
        </div>
      </div>

      {[
        'Learn how to build MCP server with Keycloak',
        'Refactor note page',
        'Learn how to intergrate n8n',
      ].map((item, key) => {
        return (
          <div key={key}>
            <div className="pb-4 pt-4 border-b flex items-start bg-white">
              <div className="flex-grow mr-2">
                <div className="flex items-start gap-2 flex-grow">
                  <div>
                    <RadioGroup />
                  </div>
                  <div className="mb-2 flex-grow" contentEditable>
                    {item}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div>created at: 16:00 07/08/2026</div>
                </div>
              </div>
              <div>
                <Trash2 />
              </div>
            </div>
          </div>
        );
      })}

      <div>
        <div className="pb-4 pt-4 border-b flex items-start bg-white">
          <div className="flex-grow mr-2">
            <div className="flex items-start gap-2 flex-grow">
              <div>
                <RadioGroup />
              </div>
              <div className="mb-2 flex-grow line-through" contentEditable>
                Build inbox feature
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div>done at: 20:05 07/08/2026</div>
            </div>
          </div>
          <div>
            <Trash2 />
          </div>
        </div>
      </div>
    </div>
  );
}
