package org.demo.repository.projection;

import org.demo.entity.enums.SaleStatus;

public record DashboardSalesByMonthAndStatusPrj(String id, int month, int year, SaleStatus status, Long count) {

}
