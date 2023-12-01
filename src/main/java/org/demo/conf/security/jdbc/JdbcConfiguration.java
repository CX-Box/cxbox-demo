package org.demo.conf.security.jdbc;

import java.util.function.Consumer;
import org.springframework.boot.autoconfigure.session.JdbcSessionProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.PostgreSqlJdbcIndexedSessionRepositoryCustomizer;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionOperations;

/**
 * Problem: When using Spring Session JDBC, issues arise with transaction closure.
 * The library interferes with the transaction processing logic from the kernel
 * by calling the previously queued AfterTransactionCompletionProc already on a closed transaction,
 * which leads to the call of transaction handlers on already closed transactions.
 * This can cause failures in the transaction processing logic and lead to a drop
 * in the list of changes on entities.
 *
 * Solution: To prevent unwanted interference with the transaction closure
 * process when using Spring Session JDBC, it is necessary to override the TransactionOperations bean
 * with the name springSessionTransactionOperations.
 * This will enable proper transaction management and mitigate potential failures in
 * transaction handling logic and the collapse of entity change listeners.
 */

@Configuration
@EnableConfigurationProperties(JdbcSessionProperties.class)
public class JdbcConfiguration {

	/**
	 * Bean for customizing the PostgreSQL JDBC indexed session repository.
	 *
	 * @return The PostgreSqlJdbcIndexedSessionRepositoryCustomizer bean
	 */

	@Bean
	public PostgreSqlJdbcIndexedSessionRepositoryCustomizer postgreSqlJdbcIndexedSessionRepositoryCustomizer() {
		return new PostgreSqlJdbcIndexedSessionRepositoryCustomizer();
	}

	/**
	 * Bean for providing transaction operations for Spring Session.
	 * This bean is necessary for the transaction to work correctly when using Spring Session JDBC
	 *
	 * @return The TransactionOperations bean for Spring Session
	 */

	@Bean("springSessionTransactionOperations")
	public TransactionOperations springSessionTransactionOperations() {
		return new TransactionOperations() {

			@Override
			public <T> T execute(TransactionCallback<T> action) throws TransactionException {
				return action.doInTransaction(new SimpleTransactionStatus(false));
			}

			@Override
			public void executeWithoutResult(Consumer<TransactionStatus> action) throws TransactionException {
				action.accept(new SimpleTransactionStatus(false));
			}

		};
	}

}