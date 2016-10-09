package vlab.server_java.check;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.StringArrayDeserializer;
import rlcp.check.ConditionForChecking;
import rlcp.generate.GeneratingResult;
import rlcp.server.processor.check.CheckProcessor;
import rlcp.server.processor.check.PreCheckProcessor;
import rlcp.server.processor.check.PreCheckProcessor.PreCheckResult;
import rlcp.server.processor.check.PreCheckResultAwareCheckProcessor;
import vlab.server_java.model.*;
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
        BigDecimal points = new BigDecimal("1.0");
        String comment = "Решение верно";
        try {
            instructions = prepareInputJsonString(instructions);
            generatingResult = new GeneratingResult(
                    generatingResult.getText(),
                    prepareInputJsonString(generatingResult.getCode()),
                    prepareInputJsonString(generatingResult.getInstructions())
            );

            ObjectMapper mapper = new ObjectMapper();

            CheckTask checkTask = mapper.readValue(instructions, CheckTask.class);
            GenerateInstructionsResult varInstr = mapper.readValue(generatingResult.getInstructions(), GenerateInstructionsResult.class);
            GenerateCodeResult varCode = mapper.readValue(generatingResult.getCode(), GenerateCodeResult.class);
            if (checkTask.getTable().size() < 2){
                points = points.subtract(new BigDecimal("1.0"));
                comment = "Недостаточно экспериментов.";
            } else {
                for (int i = 0; i < checkTask.getTable().size(); i++){
                    String stringTask = "{'r': " + checkTask.getTable().get(i).getR() + ", 't': " + checkTask.getTable().get(i).getT2() + "}";
                    CalculateTask rowTask = mapper.readValue(stringTask, CalculateTask.class);
                    CalculateCodeResult result = new RungeKuttaLab1().calculate(rowTask, varCode, varInstr);
                }
                boolean checkI = false, checkV = false;
                if (checkTask.getI().equals(varInstr.getI())){
                    checkI = true;
                }
                if (checkTask.getV().equals(varInstr.getV())){
                    checkV = true;
                }
                if (!(checkI && checkV)){
                    comment = "Решение неверно. ";
                    if (!checkI){
                        points = points.subtract(new BigDecimal("0.2"));
                        comment += "Ваш ответ: i = " + checkTask.getI() + ", правильный ответ: i = " + varInstr.getI() + ". ";
                    }
                    if (!checkV){
                        points = points.subtract(new BigDecimal("0.2"));
                        comment += "Ваш ответ: v = " + checkTask.getV() + ", правильный ответ: v = " + varInstr.getV() + ". ";
                    }
                }
            }
        } catch(Exception e){
            comment = "Failed, " + e.getMessage();
        }
        return new CheckingSingleConditionResult(points, comment);
    }

    @Override
    public void setPreCheckResult(PreCheckResult<String> preCheckResult) {}
}
