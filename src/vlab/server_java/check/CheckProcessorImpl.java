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
        BigDecimal points = new BigDecimal("1.0");
        String comment = "";
        BigDecimal secondsMax = new BigDecimal("30.0");
        BigDecimal secondsMin = new BigDecimal("0.0");
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
                BigDecimal stringPoints = new BigDecimal("0.6").divide(new BigDecimal(checkTask.getTable().size()));
                for (int i = 0; i < checkTask.getTable().size(); i++){
                    boolean checkTimeData = false, checkRadiusData = false, checkSMultiplicity = false;
                    if (checkTask.getTable().get(i).getT1().compareTo(checkTask.getTable().get(i).getT2()) == -1 &&
                            (checkTask.getTable().get(i).getT1().compareTo(secondsMin) == 1 || checkTask.getTable().get(i).getT1().compareTo(secondsMin) == 0) &&
                            (checkTask.getTable().get(i).getT2().compareTo(secondsMax) == -1 || checkTask.getTable().get(i).getT2().compareTo(secondsMax) == 0) ){
                        checkTimeData = true;
                    } else {
                        comment += "Некорректные данные в строке таблицы №" + (i+1) + " (не выполняется условие 1 <= t1 < t2 <= 30). ";
                    }
                    if((checkTask.getTable().get(i).getR().compareTo(varCode.getRadiusBounds()[0]) == 1 ||
                            checkTask.getTable().get(i).getR().compareTo(varCode.getRadiusBounds()[0]) == 0) &&
                            (checkTask.getTable().get(i).getR().compareTo(varCode.getRadiusBounds()[1]) == -1 ||
                                    checkTask.getTable().get(i).getR().compareTo(varCode.getRadiusBounds()[1]) == 0)){
                        checkRadiusData = true;
                    } else {
                        comment += "Некорректные данные в строке таблицы №" + (i+1) + " (радиус не принадлежит данному промежутку). ";
                    }
                    if (checkTask.getTable().get(i).getS().floatValue() % 0.5 == 0) {
                        checkSMultiplicity = true;
                    } else {
                        comment += "Некорректные данные в строке таблицы №" + (i+1) + " (продолжительность измеряется в половинах периода, должна быть кратна 0.5). ";
                    }
                    if (checkRadiusData && checkTimeData && checkSMultiplicity) {
                        String stringTask = "{\"r\": " + checkTask.getTable().get(i).getR() + ", \"t\": " +
                                checkTask.getTable().get(i).getT2().add(new BigDecimal("0.02")) + "}";
                        CalculateTask rowTask = mapper.readValue(stringTask, CalculateTask.class);
                        CalculateCodeResult result = new RungeKuttaLab1().calculate(rowTask, varCode, varInstr);
                        boolean checkPhi1 = false,
                                checkPhi2 = false,
                                checkS = false,
                                checkExtremumPhi1 = false,
                                checkExtremumPhi2 = false,
                                checkT1 = false,
                                checkT2 = false;
                        int rowIndexT1 = 0,
                                rowIndexT2 = 0;;
                        for (int j=0; j < result.getTable().size(); j++){
                            if (checkTask.getTable().get(i).getT1().compareTo(result.getTable().get(j)[0]) == 0){
                                rowIndexT1 = j;
                                checkT1 = true;
                            }
                        }
                        for (int j=0; j < result.getTable().size(); j++){
                            if (checkTask.getTable().get(i).getT2().compareTo(result.getTable().get(j)[0]) == 0){
                                rowIndexT2 = j;
                                checkT2 = true;
                            }
                        }
                        if (checkT1 && checkT2){
                            if (checkTask.getTable().get(i).getPhi1().compareTo(result.getTable().get(rowIndexT1)[1]) == 0){
                                checkPhi1 = true;
                            } else {
                                comment += "Неверное значение Phi1 в строке " + (i+1) + ". ";
                            }
                            if (checkTask.getTable().get(i).getPhi2().compareTo(result.getTable().get(rowIndexT2)[1]) == 0){
                                checkPhi2 = true;
                            } else {
                                comment += "Неверное значение Phi2 в строке " + (i+1) + ". ";
                            }
                            if (rowIndexT1 != 0){
                                if ((result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1-1)[1]) == -1 &&
                                        result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1+1)[1]) == -1 ) ||
                                        (result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1-1)[1]) == 1 &&
                                                result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1+1)[1]) == 1)){
                                    checkExtremumPhi1 = true;
                                } else {
                                    comment += "Phi1 не является экстремумом (строка " + (i+1) + "). ";
                                }
                            } else {
                                if ((result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1+1)[1]) == -1 ) ||
                                        (result.getTable().get(rowIndexT1)[1].compareTo(result.getTable().get(rowIndexT1+1)[1]) == 1)){
                                    checkExtremumPhi1 = true;
                                } else {
                                    comment += "Phi1 не является экстремумом (строка " + (i+1) + "). ";
                                }
                            }
                            if ((result.getTable().get(rowIndexT2)[1].compareTo(result.getTable().get(rowIndexT2-1)[1]) == -1 &&
                                    result.getTable().get(rowIndexT2)[1].compareTo(result.getTable().get(rowIndexT2+1)[1]) == -1 ) ||
                                    (result.getTable().get(rowIndexT2)[1].compareTo(result.getTable().get(rowIndexT2-1)[1]) == 1 &&
                                            result.getTable().get(rowIndexT2)[1].compareTo(result.getTable().get(rowIndexT2+1)[1]) == 1)){
                                checkExtremumPhi2 = true;
                            } else {
                                comment += "Phi2 не является экстремумом (строка " + (i+1) + "). ";
                            }
                            double numberS = 0;
                            for (int j = rowIndexT1; j < rowIndexT2; j++){
                                if ((result.getTable().get(j)[1].compareTo(new BigDecimal("0.0")) == 1 &&
                                        result.getTable().get(j+1)[1].compareTo(new BigDecimal("0.0")) == -1) ||
                                        (result.getTable().get(j)[1].compareTo(new BigDecimal("0.0")) == 0) ||
                                        (result.getTable().get(j)[1].compareTo(new BigDecimal("0.0")) == -1 &&
                                                result.getTable().get(j+1)[1].compareTo(new BigDecimal("0.0")) == 1)){
                                    numberS = numberS + 0.5;
                                }
                            }
                            if (checkTask.getTable().get(i).getS().compareTo(new BigDecimal(numberS)) == 0){
                                checkS = true;
                            } else {
                                comment += "Неверное значение продолжительности S (строка " + (i+1) + "). ";
                            }
                            if (! (checkPhi1 && checkPhi2 && checkS && checkExtremumPhi1 && checkExtremumPhi2)) {
                                points = points.subtract(stringPoints);
                            }
                        } else {
                            comment += "Неверное значение времени в строке " + (i+1) + ". ";
                            points = points.subtract(stringPoints);
                        }
                    } else {
                        points = points.subtract(stringPoints);
                    }
                }
                boolean checkI = false, checkV = false;
                if (checkTask.getI().equals(varInstr.getI())){
                    checkI = true;
                }
                if (checkTask.getV().equals(varInstr.getV())){
                    checkV = true;
                }
                if (!(checkI && checkV)){
                    comment += "Решение неверно. ";
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
            if (points.compareTo(new BigDecimal("1.0")) == 0){
                comment = "Решение верно";
            }
        } catch(Exception e){
            points = points.subtract(new BigDecimal("1.0"));
            comment = "Failed, " + e.getMessage();
        }
        return new CheckingSingleConditionResult(points, comment);
    }

    @Override
    public void setPreCheckResult(PreCheckResult<String> preCheckResult) {}
}
