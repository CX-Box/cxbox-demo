package org.demo.repository.projection;

public record DashboardSalesByMonthAndProductPrj(String id, int month, int year, Object product, Long sum) {

}
