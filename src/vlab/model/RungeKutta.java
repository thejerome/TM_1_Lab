package vlab.model;

import java.util.function.Function;

import static java.lang.Math.pow;
import static java.lang.Math.sin;
import static java.lang.Math.sqrt;

/**
 * Created by efimchick on 27.04.16.
 */
public class RungeKutta {

    public static class Param{
        double[] value;
        Function<Param[], Double> function;
    }



    public static void main(String[] args) {

        double g = 9.81;
        double mu = 0.1;

        double phi0 = 1;
        double omega0 = 0;

        double m = 1;
        double i = 0.03;
        double r = 0.03;

        double a = m * (i*i + r*r);
        double b = 1 / a;

        double G = g * m;



        double k20 = b*G*r;
        double n = b*mu/2;

        double h = 0.0001;
        double timeLimit = 4;

        double phiI = phi0;
        double omegaI = omega0;

        for (double t = 0; t < timeLimit; t+= h){
            double kOmega1 = h * (-(2*n) * (omegaI) - (k20 ) * sin(phiI));
            double kOmega2 = h * (-(2*n) * (omegaI) - (k20 ) * sin(phiI + kOmega1 / 2));
            double kOmega3 = h * (-(2*n) * (omegaI) - (k20 ) * sin(phiI + kOmega2 / 2));
            double kOmega4 = h * (-(2*n) * (omegaI) - (k20 ) * sin(phiI + kOmega3));

            double deltaOmega = (kOmega1 + 2*kOmega2 + 2*kOmega3 + kOmega4) / 6;

            double kPhi1 = h * omegaI;
            double kPhi2 = h * (omegaI + kPhi1/2);
            double kPhi3 = h * (omegaI + kPhi2/2);
            double kPhi4 = h * (omegaI + kPhi3);

            double deltaPhi = (kPhi1 + 2*kPhi2 + 2*kPhi3 + kPhi4) / 6;

            phiI += deltaPhi;
            omegaI += deltaOmega;
            System.out.printf("%.2f , omega = %.2f , phi = %.2f", t, omegaI, phiI);
            System.out.println();

        }



    }

}
