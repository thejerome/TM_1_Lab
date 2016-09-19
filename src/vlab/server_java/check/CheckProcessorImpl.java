package vlab.server_java.check;

import com.fasterxml.jackson.databind.ObjectMapper;
import rlcp.check.ConditionForChecking;
import rlcp.generate.GeneratingResult;
import rlcp.server.processor.check.CheckProcessor;
import rlcp.server.processor.check.PreCheckProcessor;
import rlcp.server.processor.check.PreCheckProcessor.PreCheckResult;
import rlcp.server.processor.check.PreCheckResultAwareCheckProcessor;
import vlab.server_java.model.CheckTask;
import vlab.server_java.model.util.HtmlParamEscaper;

import java.math.BigDecimal;

import static vlab.server_java.model.util.HtmlParamEscaper.prepareInputJsonString;

/**
 * Simple CheckProcessor implementation. Supposed to be changed as needed to provide
 * necessary Check method support.
 */
public class CheckProcessorImpl implements PreCheckResultAwareCheckProcessor<String> {
    @Override
    public CheckingSingleConditionResult checkSingleCondition(ConditionForChecking condition, String instructions, GeneratingResult generatingResult) throws Exception {
        //do check logic here

        instructions = prepareInputJsonString(instructions);

        ObjectMapper mapper = new ObjectMapper();

        CheckTask checkTask = mapper.readValue(instructions, CheckTask.class);

        BigDecimal points = new BigDecimal(1.0);
        String comment = "it's ok";

        return new CheckingSingleConditionResult(points, comment);
    }

    @Override
    public void setPreCheckResult(PreCheckResult<String> preCheckResult) {}
}
