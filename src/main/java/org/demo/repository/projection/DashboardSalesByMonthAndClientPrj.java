package org.demo.repository.projection;

public record DashboardSalesByMonthAndClientPrj(String id, int month, int year, String fullName, Long sum) {

}
