package core.widget;

import lombok.Getter;

@Getter
public enum WidgetType {
    LIST("List"),
    FORM("Form"),
    STEPS("Steps"),
    INFO("Info"),
    BREAD("Breadcrumbs"),
    DYNAMIC("DynamicInfo"),
    INFO_FIXED("InfoFixed"),
    INFO_HOVER("InfoHover"),
    STATS_BLOCK("StatsBlock"),
    ADDITIONAL_INFORMATION("AdditionalInfo"),
    STEPPER("Steps"),
    GROUPINGHIERARCHY("GroupingHierarchy");

    private final String name;

    WidgetType(String name) {
        this.name = name;
    }

}
