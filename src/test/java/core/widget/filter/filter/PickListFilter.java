package core.widget.filter.filter;

import core.widget.ListHelper;

public class PickListFilter extends AbstractFilter<String> {
    public PickListFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String value) {

    }

    @Override
    public String getTypeFilter() {
        return null;
    }
}
